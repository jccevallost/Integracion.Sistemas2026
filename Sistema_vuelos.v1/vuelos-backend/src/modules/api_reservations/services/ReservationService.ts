// application/services/ReservationService.ts
import { randomBytes } from 'crypto';
import { IReservationService, CreateReservationDto } from '../interfaces/IReservationService.js';
import { IReservationRepository } from '../interfaces/IReservationRepository.js';
import { IFlightsServiceClient }  from '../../../shared/http-clients/FlightsServiceClient.js';
import { Promotion } from '../../api_promotions/entities/Promotion.js';
import {
  NotFoundException, ValidationException,
  ForbiddenException, NoAvailabilityException, ConflictException,
} from '../../../shared/exceptions/BusinessException.js';

export class ReservationService implements IReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly flightsClient: IFlightsServiceClient,
  ) {}

  private generateCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async create(userId: string, dto: CreateReservationDto) {
    if (!dto.flightClassId || !dto.passengers?.length) {
      throw new ValidationException('flightClassId y al menos un pasajero son requeridos');
    }
    const requestedSeats = dto.passengers
      .map((p) => p.seatNumber?.trim().toUpperCase())
      .filter(Boolean) as string[];
    if (new Set(requestedSeats).size !== requestedSeats.length) {
      throw new ConflictException('Hay asientos repetidos en la misma solicitud');
    }

    // ── Paso 1: validar clase de vuelo vía HTTP ────────────────────────
    const flightClass = await this.flightsClient.findFlightClassById(dto.flightClassId);
    if (!flightClass) throw new NotFoundException('Clase de vuelo', dto.flightClassId);
    if (!flightClass.hasAvailability(dto.passengers.length)) {
      throw new NoAvailabilityException(`Solo quedan ${flightClass.availableSeats} asientos disponibles`);
    }

    const baseAmount = flightClass.calculateTotal(dto.passengers.length);
    let totalAmount  = baseAmount;
    let promotionId: string | null = null;

    // ── Paso 2: validar promoción vía HTTP ────────────────────────────
    if (dto.promotionCode) {
      const promo = await this.flightsClient.findPromotionByCode(dto.promotionCode);
      if (!promo || !promo.isActive) {
        throw new ValidationException('Código promocional inválido o inactivo');
      }
      if (promo.maxUsages !== null && Number(promo.currentUsages) >= Number(promo.maxUsages)) {
        throw new ValidationException('Este código promocional ha alcanzado su límite máximo de usos');
      }
      const promoEntity = new Promotion(
        promo.id, promo.code, promo.discountType,
        Number(promo.discountValue), promo.isActive,
      );
      totalAmount  = promoEntity.applyDiscount(baseAmount);
      promotionId  = promo.id;
    }

    // ── Paso 3 (saga): decrementar asientos en flights-service ────────
    try {
      await this.flightsClient.decrementSeats(dto.flightClassId, dto.passengers.length);
    } catch (err: any) {
      if (err.message === 'NO_AVAILABILITY') {
        throw new NoAvailabilityException('No quedan suficientes asientos disponibles para esta clase');
      }
      throw err;
    }

    // ── Paso 4: crear la reserva en booking DB ────────────────────────
    let reservation: any;
    try {
      reservation = await this.reservationRepository.create({
        userId,
        flightId:         (flightClass as any).flightId,
        promotionId,
        reservationCode:  this.generateCode(),
        totalAmount,
        status:           'CONFIRMED',
        flightClassId:    dto.flightClassId,
        passengers:       dto.passengers.map((p) => ({
          ...p,
          seatNumber: p.seatNumber?.trim().toUpperCase() || undefined,
        })),
        passengerCount: dto.passengers.length,
      });
    } catch (err: any) {
      // Compensar: restaurar asientos en flights-service
      await this.flightsClient.incrementSeats(dto.flightClassId, dto.passengers.length);

      if (err?.code === 'P2002' || String(err?.message ?? '').includes('reservation_passengers_flight_class_seat_unique')) {
        throw new ConflictException('Uno de los asientos seleccionados ya está ocupado. Actualiza el mapa y elige otro.');
      }
      throw err;
    }

    // ── Paso 5: incrementar uso de promoción en flights-service ───────
    if (promotionId) {
      await this.flightsClient.incrementPromotionUsage(promotionId);
    }

    return reservation;
  }

  async getMyReservations(userId: string) {
    return this.reservationRepository.findByUserId(userId);
  }

  async getById(id: string, requestingUserId: string, isAdmin: boolean) {
    const reservation = await this.reservationRepository.findByIdWithRelations(id);
    if (!reservation) throw new NotFoundException('Reserva', id);
    if (reservation.userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para ver esta reserva');
    }
    return reservation;
  }

  async cancel(id: string, requestingUserId: string, isAdmin: boolean) {
    const reservation = await this.reservationRepository.findByIdWithRelations(id);
    if (!reservation) throw new NotFoundException('Reserva', id);
    if (reservation.userId !== requestingUserId && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para cancelar esta reserva');
    }
    if (reservation.status === 'CANCELLED') {
      throw new ValidationException('La reserva ya está cancelada');
    }
    if (reservation.status === 'COMPLETED') {
      throw new ValidationException('No se puede cancelar una reserva completada');
    }

    const passengers     = (reservation as any).passengers ?? [];
    const flightClassId  = passengers[0]?.flightClassId ?? null;
    const passengerCount = passengers.length;
    const promotionId    = (reservation as any).promotionId ?? null;

    // ── Cancelar en booking DB (sin tocar flights-service) ────────────
    await this.reservationRepository.cancelAndRestoreSeats(id);

    // ── Restaurar asientos en flights-service ─────────────────────────
    if (flightClassId && passengerCount > 0) {
      await this.flightsClient.incrementSeats(flightClassId, passengerCount);
    }

    // ── Decrementar uso de promoción en flights-service ───────────────
    if (promotionId) {
      await this.flightsClient.decrementPromotionUsage(promotionId);
    }

    return { cancelled: true, reservationCode: reservation.reservationCode };
  }

  async listAll() {
    return this.reservationRepository.findAllWithRelations();
  }
}
