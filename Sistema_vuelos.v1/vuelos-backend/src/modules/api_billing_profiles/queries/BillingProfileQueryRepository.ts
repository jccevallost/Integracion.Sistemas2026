// infrastructure/queries/BillingProfileQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class BillingProfileQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, defaults] = await Promise.all([
      this.db.billingProfile.count(),
      this.db.billingProfile.count({ where: { isDefault: true } }),
    ]);
    return { total, defaults };
  }

  async findByUser(userId: string) {
    return this.db.billingProfile.findMany({
      where: { userId },
      include: { city: { include: { country: true } } },
    });
  }

  async findAll() {
    return this.db.billingProfile.findMany({
      include: { city: { include: { country: true } } },
      orderBy: { businessName: 'asc' },
    });
  }
}
