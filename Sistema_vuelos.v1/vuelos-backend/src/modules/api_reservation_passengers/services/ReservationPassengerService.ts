// application/services/ReservationPassengerService.ts
import { IReservationPassengerService } from '../interfaces/IReservationPassengerService.js';
import { IReservationPassengerRepository } from '../interfaces/IReservationPassengerRepository.js';
import {
  ConflictException,
  NotFoundException,
  ValidationException,
} from '../../../shared/exceptions/BusinessException.js';

function hasOwn(data: any, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(data ?? {}, key);
}

function isUniqueSeatConflict(err: any): boolean {
  return err?.code === 'P2002'
    || String(err?.message ?? '').includes('reservation_passengers_flight_class_seat_unique');
}

export class ReservationPassengerService implements IReservationPassengerService {
  constructor(private readonly repo: IReservationPassengerRepository) {}

  private normalizeSeatNumber(data: any): string | null | undefined {
    if (!hasOwn(data, 'seatNumber')) return undefined;
    if (data.seatNumber === null || data.seatNumber === undefined) return null;
    if (typeof data.seatNumber !== 'string') {
      throw new ValidationException('seatNumber debe ser texto');
    }

    const seat = data.seatNumber.trim().toUpperCase();
    return seat.length > 0 ? seat : null;
  }

  private async assertSeatAvailable(
    flightClassId: string | undefined,
    seatNumber: string | null | undefined,
    excludePassengerId?: string,
  ): Promise<void> {
    if (!seatNumber) return;
    if (!flightClassId) {
      throw new ValidationException('flightClassId es requerido para asignar asiento');
    }

    const conflict = await this.repo.findSeatConflict(flightClassId, seatNumber, excludePassengerId);
    if (conflict) {
      throw new ConflictException(`El asiento ${seatNumber} ya esta ocupado. Elige otro.`);
    }
  }

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Pasajero de reserva', id);
    return item;
  }

  async findByReservation(reservationId: string) { return this.repo.findByReservation(reservationId); }

  async create(data: any) {
    const normalized = { ...data };
    const seatNumber = this.normalizeSeatNumber(normalized);
    if (seatNumber !== undefined) normalized.seatNumber = seatNumber;

    await this.assertSeatAvailable(normalized.flightClassId, normalized.seatNumber);

    try {
      return await this.repo.create(normalized);
    } catch (err) {
      if (isUniqueSeatConflict(err)) {
        throw new ConflictException('Ese asiento acaba de ocuparse. Actualiza el mapa y elige otro.');
      }
      throw err;
    }
  }

  async update(id: string, data: any) {
    const current = await this.getById(id);
    const normalized = { ...data };
    const hasSeatNumber = hasOwn(normalized, 'seatNumber');
    const seatNumber = this.normalizeSeatNumber(normalized);
    if (hasSeatNumber) normalized.seatNumber = seatNumber;

    const targetFlightClassId = normalized.flightClassId ?? current.flightClassId;
    const targetSeatNumber = hasSeatNumber
      ? normalized.seatNumber
      : current.seatNumber?.trim().toUpperCase();

    await this.assertSeatAvailable(targetFlightClassId, targetSeatNumber, id);

    try {
      return await this.repo.update(id, normalized);
    } catch (err) {
      if (isUniqueSeatConflict(err)) {
        throw new ConflictException('Ese asiento acaba de ocuparse. Actualiza el mapa y elige otro.');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
