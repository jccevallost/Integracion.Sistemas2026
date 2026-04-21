// infrastructure/queries/AircraftQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class AircraftQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, withWifi, withUsb] = await Promise.all([
      this.db.aircraft.count(),
      this.db.aircraft.count({ where: { hasWifi: true } }),
      this.db.aircraft.count({ where: { hasUsb: true } }),
    ]);
    return { total, withWifi, withUsb };
  }

  async findByAirline(airlineId: string) {
    return this.db.aircraft.findMany({
      where: { airlineId },
      include: { airline: true },
      orderBy: { modelName: 'asc' },
    });
  }

  async search(query: string) {
    return this.db.aircraft.findMany({
      where: {
        OR: [
          { modelName: { contains: query, mode: 'insensitive' } },
          { registration: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { airline: true },
      take: 20,
    });
  }

  async findAll() {
    return this.db.aircraft.findMany({ include: { airline: true }, orderBy: { modelName: 'asc' } });
  }
}
