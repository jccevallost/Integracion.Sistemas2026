// infrastructure/queries/InvoiceQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class InvoiceQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, totalRevenue] = await Promise.all([
      this.db.invoice.count(),
      this.db.invoice.aggregate({ _sum: { total: true } }),
    ]);
    return { total, totalRevenue: Number(totalRevenue._sum.total ?? 0) };
  }

  async findByBillingProfile(billingProfileId: string) {
    return this.db.invoice.findMany({
      where: { billingProfileId },
      include: { payment: true, billingProfile: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.db.invoice.findMany({
      include: { payment: true, billingProfile: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
