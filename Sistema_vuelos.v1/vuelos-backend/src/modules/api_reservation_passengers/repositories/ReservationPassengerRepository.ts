// infrastructure/repositories/ReservationPassengerRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IReservationPassengerRepository } from '../interfaces/IReservationPassengerRepository.js';
import { ReservationPassenger } from '../entities/ReservationPassenger.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = {
  reservation: { select: { id: true, reservationCode: true } },
  flightClass: true,
  services: { include: { serviceConfig: { include: { service: true } } } },
  boardingPasses: true,
};

export class ReservationPassengerRepository implements IReservationPassengerRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<ReservationPassenger>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.reservationPassenger.findMany({ skip, take: limit, include }),
      this.db.reservationPassenger.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<ReservationPassenger | null> {
    return this.db.reservationPassenger.findUnique({ where: { id }, include }) as any;
  }

  async findByReservation(reservationId: string): Promise<any[]> {
    return this.db.reservationPassenger.findMany({ where: { reservationId }, include });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.reservationPassenger.findMany({ include });
  }

  async create(data: any): Promise<ReservationPassenger> {
    return this.db.reservationPassenger.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<ReservationPassenger> {
    return this.db.reservationPassenger.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.reservationPassenger.delete({ where: { id } });
  }
}
