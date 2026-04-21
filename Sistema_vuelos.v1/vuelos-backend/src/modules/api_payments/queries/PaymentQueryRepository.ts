// infrastructure/queries/PaymentQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class PaymentQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, byStatus, totalRevenue] = await Promise.all([
      this.db.payment.count(),
      this.db.payment.groupBy({ by: ['status'], _count: { id: true }, _sum: { amount: true } }),
      this.db.payment.aggregate({ _sum: { amount: true } }),
    ]);
    return {
      total,
      byStatus,
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    };
  }

  async findByReservation(reservationId: string) {
    return this.db.payment.findMany({
      where: { reservationId },
      include: { reservation: { select: { id: true, reservationCode: true, totalAmount: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.db.payment.findMany({
      include: { reservation: { select: { id: true, reservationCode: true, totalAmount: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
