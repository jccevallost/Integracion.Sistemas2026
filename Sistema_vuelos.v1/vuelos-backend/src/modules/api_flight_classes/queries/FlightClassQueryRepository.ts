// infrastructure/queries/FlightClassQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class FlightClassQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, byCabin, avgPrice] = await Promise.all([
      this.db.flightClass.count(),
      this.db.flightClass.groupBy({ by: ['cabinClass'], _count: { id: true } }),
      this.db.flightClass.aggregate({ _avg: { basePrice: true } }),
    ]);
    return {
      total,
      byCabin,
      avgBasePrice: Number(avgPrice._avg.basePrice ?? 0),
    };
  }

  async findByFlight(flightId: string) {
    return this.db.flightClass.findMany({
      where: { flightId },
      include: { flight: true },
      orderBy: { basePrice: 'asc' },
    });
  }

  async findAll() {
    return this.db.flightClass.findMany({
      include: { flight: true },
      orderBy: { basePrice: 'asc' },
    });
  }
}
