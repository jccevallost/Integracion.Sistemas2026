// infrastructure/queries/ServiceCatalogQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class ServiceCatalogQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, byCategory] = await Promise.all([
      this.db.serviceCatalog.count(),
      this.db.serviceCatalog.groupBy({ by: ['category'], _count: { id: true } }),
    ]);
    return { total, byCategory };
  }

  async search(query: string) {
    return this.db.serviceCatalog.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    return this.db.serviceCatalog.findMany({ orderBy: { name: 'asc' } });
  }
}
