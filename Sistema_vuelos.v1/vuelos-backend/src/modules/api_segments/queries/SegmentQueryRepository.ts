// infrastructure/queries/SegmentQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class SegmentQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, upcoming] = await Promise.all([
      this.db.segment.count(),
      this.db.segment.count({ where: { departureDateTime: { gte: new Date() } } }),
    ]);
    return { total, upcoming, past: total - upcoming };
  }

  async findByFlight(flightId: string) {
    return this.db.segment.findMany({
      where: { flightId },
      include: { originAirport: true, destinationAirport: true, airline: true, aircraft: true },
      orderBy: { departureDateTime: 'asc' },
    });
  }

  async findAll() {
    return this.db.segment.findMany({
      include: { originAirport: true, destinationAirport: true, airline: true, aircraft: true },
      orderBy: { departureDateTime: 'asc' },
    });
  }
}
