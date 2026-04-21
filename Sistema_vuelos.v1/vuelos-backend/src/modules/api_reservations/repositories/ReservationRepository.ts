// infrastructure/repositories/ReservationRepository.ts
import { PrismaClient } from '@prisma/client';
import { IReservationRepository } from '../interfaces/IReservationRepository.js';
import { Reservation } from '../entities/Reservation.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const fullInclude = {
  passengers: true,
  flight: {
    include: {
      segments: {
        include: {
          originAirport: { include: { city: { include: { country: true } } } },
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
      where: { userId },
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

  async create(data: any): Promise<Reservation> {
    // Transacción atómica: crear reserva + decrementar asientos + incrementar uso de promo
    return this.db.$transaction(async (tx) => {
      // Recheck disponibilidad
      const fc = await tx.flightClass.findUnique({ where: { id: data.flightClassId } });
      if (!fc || fc.availableSeats < data.passengerCount) {
        throw new Error('NO_AVAILABILITY');
      }

      const reservation = await tx.reservation.create({
        data: {
          reservationCode: data.reservationCode,
          userId: data.userId,
          flightId: data.flightId,
          promotionId: data.promotionId,
          totalAmount: data.totalAmount,
          status: data.status,
          passengers: {
            create: data.passengers.map((p: any) => ({
              flightClassId: data.flightClassId,
              firstName: p.firstName,
              lastName: p.lastName,
              documentNumber: p.documentNumber,
              seatNumber: p.seatNumber ?? null,
            })),
          },
        },
        include: fullInclude,
      });

      await tx.flightClass.update({
        where: { id: data.flightClassId },
        data: { availableSeats: { decrement: data.passengerCount } },
      });

      if (data.promotionId_forUsageIncrement) {
        await tx.promotion.update({
          where: { id: data.promotionId_forUsageIncrement },
          data: { currentUsages: { increment: 1 } },
        });
      }

      return reservation;
    }) as any;
  }

  async update(id: string, data: any): Promise<Reservation> {
    return this.db.reservation.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.reservation.delete({ where: { id } });
  }
}
