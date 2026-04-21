// infrastructure/queries/CountryQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class CountryQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, withCities] = await Promise.all([
      this.db.country.count(),
      this.db.country.count({ where: { cities: { some: {} } } }),
    ]);
    return { total, withCities, withoutCities: total - withCities };
  }

  async search(query: string) {
    return this.db.country.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { isoCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    return this.db.country.findMany({ orderBy: { name: 'asc' } });
  }
}
