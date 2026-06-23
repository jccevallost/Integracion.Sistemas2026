// infrastructure/repositories/ReservationPassengerRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IReservationPassengerRepository } from '../interfaces/IReservationPassengerRepository.js';
import { ReservationPassenger } from '../entities/ReservationPassenger.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const fullInclude = {
  reservation: { select: { id: true, reservationCode: true } },
  flightClass: true,
  extraServices: { include: { serviceConfig: { include: { service: true } } } },
  boardingPasses: true,
};

export class ReservationPassengerRepository implements IReservationPassengerRepository {
  private readonly include: any;

  constructor(private readonly db: PrismaClient) {
    this.include = this.resolveInclude();
  }

  private relationNames(modelName: string): Set<string> | null {
    const fields = (this.db as any)._runtimeDataModel?.models?.[modelName]?.fields;
    if (!Array.isArray(fields)) return null;

    return new Set(
      fields
        .filter((field: any) => field.kind === 'object')
        .map((field: any) => field.name),
    );
  }

  private resolveInclude(): any {
    const passengerRelations = this.relationNames('ReservationPassenger');
    if (!passengerRelations) return fullInclude;

    const include: any = {};
    if (passengerRelations.has('reservation')) {
      include.reservation = { select: { id: true, reservationCode: true } };
    }
    if (passengerRelations.has('flightClass')) {
      include.flightClass = true;
    }
    if (passengerRelations.has('extraServices')) {
      const passengerServiceRelations = this.relationNames('PassengerService');
      include.extraServices = passengerServiceRelations?.has('serviceConfig')
        ? { include: { serviceConfig: { include: { service: true } } } }
        : true;
    }
    if (passengerRelations.has('boardingPasses')) {
      include.boardingPasses = true;
    }

    return include;
  }

  async findAll(page = 1, limit = 100): Promise<PagedResult<ReservationPassenger>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.reservationPassenger.findMany({ skip, take: limit, include: this.include }),
      this.db.reservationPassenger.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<ReservationPassenger | null> {
    return this.db.reservationPassenger.findUnique({ where: { id }, include: this.include }) as any;
  }

  async findByReservation(reservationId: string): Promise<any[]> {
    return this.db.reservationPassenger.findMany({ where: { reservationId }, include: this.include });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.reservationPassenger.findMany({ include: this.include });
  }

  async findSeatConflict(
    flightClassId: string,
    seatNumber: string,
    excludePassengerId?: string,
  ): Promise<any | null> {
    return this.db.reservationPassenger.findFirst({
      where: {
        flightClassId,
        seatNumber,
        ...(excludePassengerId ? { id: { not: excludePassengerId } } : {}),
        reservation: { status: { not: 'CANCELLED' } },
      },
      select: {
        id: true,
        seatNumber: true,
        reservation: { select: { id: true, reservationCode: true } },
      },
    });
  }

  async create(data: any): Promise<ReservationPassenger> {
    return this.db.reservationPassenger.create({ data, include: this.include }) as any;
  }

  async update(id: string, data: any): Promise<ReservationPassenger> {
    return this.db.reservationPassenger.update({ where: { id }, data, include: this.include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.reservationPassenger.delete({ where: { id } });
  }
}
