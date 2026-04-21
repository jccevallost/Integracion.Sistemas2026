// infrastructure/queries/AirlineServiceConfigQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class AirlineServiceConfigQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, byCurrency] = await Promise.all([
      this.db.airlineServiceConfig.count(),
      this.db.airlineServiceConfig.groupBy({ by: ['currency'], _count: { id: true } }),
    ]);
    return { total, byCurrency };
  }

  async findAll() {
    return this.db.airlineServiceConfig.findMany({
      include: { service: true, airline: true },
      orderBy: { airline: { name: 'asc' } },
    });
  }

  async findByAirline(airlineId: string) {
    return this.db.airlineServiceConfig.findMany({
      where: { airlineId },
      include: { service: true, airline: true },
    });
  }
}
