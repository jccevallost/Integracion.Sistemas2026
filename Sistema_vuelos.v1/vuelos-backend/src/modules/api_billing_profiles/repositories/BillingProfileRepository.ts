// infrastructure/repositories/BillingProfileRepository.ts
import { PrismaClient } from '@prisma/client';
import { IBillingProfileRepository } from '../interfaces/IBillingProfileRepository.js';
import { BillingProfile } from '../entities/BillingProfile.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = { city: { include: { country: true } } };

export class BillingProfileRepository implements IBillingProfileRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<BillingProfile>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.billingProfile.findMany({ skip, take: limit, include }),
      this.db.billingProfile.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<BillingProfile | null> {
    return this.db.billingProfile.findUnique({ where: { id }, include }) as any;
  }

  async findByUser(userId: string): Promise<any[]> {
    return this.db.billingProfile.findMany({ where: { userId }, include });
  }

  async findDefaultByUser(userId: string): Promise<BillingProfile | null> {
    return this.db.billingProfile.findFirst({ where: { userId, isDefault: true }, include }) as any;
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.billingProfile.findMany({ include });
  }

  async create(data: any): Promise<BillingProfile> {
    return this.db.billingProfile.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<BillingProfile> {
    return this.db.billingProfile.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.billingProfile.delete({ where: { id } });
  }
}
