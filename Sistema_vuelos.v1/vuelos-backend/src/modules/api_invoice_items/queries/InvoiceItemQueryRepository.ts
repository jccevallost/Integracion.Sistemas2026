// infrastructure/queries/InvoiceItemQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class InvoiceItemQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, totals] = await Promise.all([
      this.db.invoiceItem.count(),
      this.db.invoiceItem.aggregate({ _sum: { totalPrice: true } }),
    ]);
    return { total, totalRevenue: Number(totals._sum.totalPrice ?? 0) };
  }

  async findByInvoice(invoiceId: string) {
    return this.db.invoiceItem.findMany({ where: { invoiceId } });
  }

  async findAll() {
    return this.db.invoiceItem.findMany({ orderBy: { description: 'asc' } });
  }
}
