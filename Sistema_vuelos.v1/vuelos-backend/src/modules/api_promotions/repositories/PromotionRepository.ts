// infrastructure/repositories/PromotionRepository.ts
import { PrismaClient } from '@prisma/client';
import { IPromotionRepository } from '../interfaces/IPromotionRepository.js';
import { Promotion } from '../entities/Promotion.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

export class PromotionRepository implements IPromotionRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<Promotion>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.promotion.findMany({ skip, take: limit, orderBy: { code: 'asc' } }),
      this.db.promotion.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Promotion | null> {
    return this.db.promotion.findUnique({ where: { id } }) as any;
  }

  async findByCode(code: string): Promise<Promotion | null> {
    return this.db.promotion.findUnique({ where: { code } }) as any;
  }

  async incrementUsage(id: string): Promise<void> {
    await this.db.promotion.update({
      where: { id },
      data: { currentUsages: { increment: 1 } },
    });
  }

  async create(data: any): Promise<Promotion> {
    return this.db.promotion.create({ data }) as any;
  }

  async update(id: string, data: any): Promise<Promotion> {
    return this.db.promotion.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.promotion.delete({ where: { id } });
  }
}
