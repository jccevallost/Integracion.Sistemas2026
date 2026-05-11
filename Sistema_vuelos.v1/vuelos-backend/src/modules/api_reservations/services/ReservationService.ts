// application/services/ReservationService.ts
import { randomBytes } from 'crypto';
import { IReservationService, CreateReservationDto } from '../interfaces/IReservationService.js';
import { IReservationRepository } from '../interfaces/IReservationRepository.js';
import { IFlightClassRepository } from '../../api_flight_classes/interfaces/IFlightClassRepository.js';
import { IPromotionRepository } from '../../api_promotions/interfaces/IPromotionRepository.js';
import { Promotion } from '../../api_promotions/entities/Promotion.js';
import {
  NotFoundException, ValidationException,
  ForbiddenException, NoAvailabilityException, ConflictException,
} from '../../../shared/exceptions/BusinessException.js';

export class ReservationService implements IReservationService {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly flightClassRepository: IFlightClassRepository,
    private readonly promotionRepository: IPromotionRepository,
  ) {}

  private generateCode(): string {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async create(userId: string, dto: CreateReservationDto) {
    if (!dto.flightClassId || !dto.passengers?.length) {
      throw new ValidationException('flightClassId y al menos un pasajero son requeridos');
    }
    const requestedSeats = dto.passengers
      .map((passenger) => passenger.seatNumber?.trim().toUpperCase())
      .filter(Boolean) as string[];
    if (new Set(requestedSeats).size !== requestedSeats.length) {
      throw new ConflictException('Hay asientos repetidos en la misma solicitud');
    }

    const flightClass = await this.flightClassRepository.findById(dto.flightClassId);
    if (!flightClass) throw new NotFoundException('Clase de vuelo', dto.flightClassId);
    if (!flightClass.hasAvailability(dto.passengers.length)) {
      throw new NoAvailabilityException(`Solo quedan ${flightClass.availableSeats} asientos disponibles`);
    }

    const baseAmount = flightClass.calculateTotal(dto.passengers.length);
    let totalAmount = baseAmount;
    let promotionId: string | null = null;

    if (dto.promotionCode) {
      const promo = await this.promotionRepository.findByCode(dto.promotionCode);
      if (!promo || !promo.isActive) {
        throw new ValidationException('Código promocional inválido o inactivo');
      }
      if (promo.maxUsages !== null && Number(promo.currentUsages) >= Number(promo.maxUsages)) {
        throw new ValidationException('Este código promocional ha alcanzado su límite máximo de usos');
      }
      const promoEntity = new Promotion(
        promo.id, promo.code, promo.discountType as any,
        Number(promo.discountValue), promo.isActive,
      );
      totalAmount = promoEntity.applyDiscount(baseAmount);
      promotionId = promo.id;
    }

    try {
      return await this.reservationRepository.create({
        userId,
        flightId: (flightClass as any).flightId,
        promotionId,
        reservationCode: this.generateCode(),
        totalAmount,
        status: 'CONFIRMED',
        flightClassId: dto.flightClassId,
        passengers: dto.passengers.map((passenger) => ({
          ...passenger,
          seatNumber: passenger.seatNumber?.trim().toUpperCase() || undefined,
        })),
        passengerCount: dto.passengers.length,
        promotionId_forUsageIncrement: promotionId,
      });
    } catch (err: any) {
      if (err?.message === 'NO_AVAILABILITY') {
        throw new NoAvailabilityException('No quedan suficientes asientos disponibles para esta clase');
      }
      if (err?.code === 'P2002' || String(err?.message ?? '').includes('reservation_passengers_flight_class_seat_unique')) {
        throw new ConflictException('Uno de los asientos seleccionados ya está ocupado. Actualiza el mapa y elige otro.');
      }
      throw err;
    }
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

    const passengers    = (reservation as any).passengers ?? [];
    const flightClassId = passengers[0]?.flightClassId ?? null;
    const passengerCount = passengers.length;
    const promotionId   = (reservation as any).promotionId ?? null;

    if (flightClassId && passengerCount > 0) {
      await this.reservationRepository.cancelAndRestoreSeats(id, flightClassId, passengerCount);
    } else {
      await this.reservationRepository.updateStatus(id, 'CANCELLED');
    }

    if (promotionId) {
      await this.promotionRepository.decrementUsage(promotionId);
    }

    return { cancelled: true, reservationCode: reservation.reservationCode };
  }

  async listAll() {
    return this.reservationRepository.findAllWithRelations();
  }
}
