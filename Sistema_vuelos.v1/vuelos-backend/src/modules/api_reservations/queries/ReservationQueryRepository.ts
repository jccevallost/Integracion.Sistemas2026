// infrastructure/queries/ReservationQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class ReservationQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getDashboardStats() {
    const [totalReservations, confirmedReservations, cancelledReservations, totalRevenue] =
      await Promise.all([
        this.db.reservation.count(),
        this.db.reservation.count({ where: { status: 'CONFIRMED' } }),
        this.db.reservation.count({ where: { status: 'CANCELLED' } }),
        this.db.reservation.aggregate({
          where: { status: 'CONFIRMED' },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      totalReservations,
      confirmedReservations,
      cancelledReservations,
      totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
    };
  }

  async getReservationsByUser(userId: string) {
    return this.db.reservation.findMany({
      where: { userId },
      include: {
        flight: {
          include: {
            segments: { include: { airline: true }, orderBy: { departureDateTime: 'asc' } },
          },
        },
        passengers: true,
        promotion: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
