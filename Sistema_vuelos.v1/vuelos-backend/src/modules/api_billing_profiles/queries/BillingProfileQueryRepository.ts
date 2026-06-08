// infrastructure/queries/BillingProfileQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class BillingProfileQueryRepository {
  constructor(
    private readonly db: PrismaClient,
    private readonly options: { includeCity?: boolean } = {},
  ) {}

  private relationInclude() {
    return this.options.includeCity === false ? undefined : { city: { include: { country: true } } };
  }

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
      include: this.relationInclude(),
    });
  }

  async findAll() {
    return this.db.billingProfile.findMany({
      include: this.relationInclude(),
      orderBy: { businessName: 'asc' },
    });
  }
}
