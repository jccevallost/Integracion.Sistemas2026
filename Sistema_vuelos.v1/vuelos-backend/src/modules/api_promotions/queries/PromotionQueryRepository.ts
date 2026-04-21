// infrastructure/queries/PromotionQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class PromotionQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, active, percentage, fixed] = await Promise.all([
      this.db.promotion.count(),
      this.db.promotion.count({ where: { isActive: true } }),
      this.db.promotion.count({ where: { discountType: 'PERCENTAGE' } }),
      this.db.promotion.count({ where: { discountType: 'FIXED_AMOUNT' } }),
    ]);
    return { total, active, inactive: total - active, percentage, fixed };
  }

  async findAll() {
    return this.db.promotion.findMany({ orderBy: { code: 'asc' } });
  }

  async search(query: string) {
    return this.db.promotion.findMany({
      where: { code: { contains: query, mode: 'insensitive' } },
      take: 20,
    });
  }
}
