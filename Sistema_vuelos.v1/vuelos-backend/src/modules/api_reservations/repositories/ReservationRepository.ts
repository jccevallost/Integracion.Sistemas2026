// infrastructure/repositories/ReservationRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IReservationRepository } from '../interfaces/IReservationRepository.js';
import { Reservation } from '../entities/Reservation.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

// TODO(Phase-4): Once DBs are split, replace these cross-service includes with
// HTTP calls to flights-service and auth-service instead of Prisma JOINs.
const fullInclude = {
  passengers: true,
  flight: {
    include: {
      segments: {
        include: {
          originAirport:      { include: { city: { include: { country: true } } } },
          destinationAirport: { include: { city: { include: { country: true } } } },
          airline: true,
        },
        orderBy: { departureDateTime: 'asc' as const },
      },
      flightClasses: true,
    },
  },
  promotion: true,
  user: { select: { id: true, email: true, firstName: true, firstLastName: true } },
};

export class ReservationRepository implements IReservationRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<Reservation>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.reservation.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.reservation.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.db.reservation.findUnique({ where: { id } }) as any;
  }

  async findByUserId(userId: string): Promise<any[]> {
    return this.db.reservation.findMany({
      where:   { userId },
      include: fullInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    return this.db.reservation.findUnique({ where: { id }, include: fullInclude });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.reservation.findMany({ include: fullInclude, orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.reservation.update({ where: { id }, data: { status: status as any } });
  }

  /**
   * Creates a reservation in the booking DB only.
   * Seat decrement and promotion-usage increment are handled by ReservationService
   * via HTTP calls to flights-service (saga pattern) — NOT here.
   */
  async create(data: any): Promise<Reservation> {
    return this.db.reservation.create({
      data: {
        reservationCode: data.reservationCode,
        userId:          data.userId,
        flightId:        data.flightId,
        promotionId:     data.promotionId,
        totalAmount:     data.totalAmount,
        status:          data.status,
        passengers: {
          create: data.passengers.map((p: any) => ({
            flightClassId:  data.flightClassId,
            firstName:      p.firstName,
            lastName:       p.lastName,
            documentNumber: p.documentNumber,
            seatNumber:     p.seatNumber ?? null,
          })),
        },
      },
      include: fullInclude,
    }) as any;
  }

  /**
   * Cancels the reservation and clears passenger seat numbers in the booking DB.
   * Seat restoration and promotion-usage decrement are handled by ReservationService
   * via HTTP calls to flights-service (saga pattern) — NOT here.
   */
  async cancelAndRestoreSeats(id: string): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.reservation.update({ where: { id }, data: { status: 'CANCELLED' } });
      await tx.reservationPassenger.updateMany({
        where: { reservationId: id },
        data:  { seatNumber: null },
      });
    });
  }

  async update(id: string, data: any): Promise<Reservation> {
    return this.db.reservation.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.reservation.delete({ where: { id } });
  }
}
