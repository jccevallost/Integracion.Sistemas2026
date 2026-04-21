// infrastructure/repositories/ServiceCatalogRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IServiceCatalogRepository } from '../interfaces/IServiceCatalogRepository.js';
import { ServiceCatalog } from '../entities/ServiceCatalog.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

export class ServiceCatalogRepository implements IServiceCatalogRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 200): Promise<PagedResult<ServiceCatalog>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.serviceCatalog.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
      this.db.serviceCatalog.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<ServiceCatalog | null> {
    return this.db.serviceCatalog.findUnique({ where: { id } }) as any;
  }

  async findByCode(code: string): Promise<ServiceCatalog | null> {
    return this.db.serviceCatalog.findFirst({ where: { code } }) as any;
  }

  async findByCategory(category: string): Promise<ServiceCatalog[]> {
    return this.db.serviceCatalog.findMany({ where: { category }, orderBy: { name: 'asc' } }) as any;
  }

  async create(data: any): Promise<ServiceCatalog> {
    return this.db.serviceCatalog.create({ data }) as any;
  }

  async update(id: string, data: any): Promise<ServiceCatalog> {
    return this.db.serviceCatalog.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.serviceCatalog.delete({ where: { id } });
  }
}
