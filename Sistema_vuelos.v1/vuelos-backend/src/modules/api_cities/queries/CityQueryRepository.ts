// infrastructure/queries/CityQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class CityQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const total = await this.db.city.count();
    return { total };
  }

  async search(query: string) {
    return this.db.city.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { country: true },
      take: 20,
      orderBy: { name: 'asc' },
    });
  }

  async findByCountry(countryId: string) {
    return this.db.city.findMany({
      where: { countryId },
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    return this.db.city.findMany({ include: { country: true }, orderBy: { name: 'asc' } });
  }
}
