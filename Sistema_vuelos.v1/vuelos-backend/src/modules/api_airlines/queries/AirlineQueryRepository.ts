// infrastructure/queries/AirlineQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class AirlineQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, byCountry] = await Promise.all([
      this.db.airline.count(),
      this.db.airline.groupBy({ by: ['countryId'], _count: { id: true } }),
    ]);
    return { total, byCountry };
  }

  async search(query: string) {
    return this.db.airline.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { iataCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { country: true },
      take: 20,
    });
  }

  async findAll() {
    return this.db.airline.findMany({ include: { country: true }, orderBy: { name: 'asc' } });
  }
}
