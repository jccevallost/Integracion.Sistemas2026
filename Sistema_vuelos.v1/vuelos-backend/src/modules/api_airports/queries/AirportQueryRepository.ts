// infrastructure/queries/AirportQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class AirportQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async searchByName(query: string) {
    return this.db.airport.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { iataCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { city: { include: { country: true } } },
      take: 20,
    });
  }

  async getAirportsByCountry(countryId: string) {
    return this.db.airport.findMany({
      where: { city: { countryId } },
      include: { city: { include: { country: true } } },
      orderBy: { iataCode: 'asc' },
    });
  }

  async getDashboardStats() {
    const [totalAirports, totalAirlines, totalAircraft] = await Promise.all([
      this.db.airport.count(),
      this.db.airline.count(),
      this.db.aircraft.count(),
    ]);
    return { totalAirports, totalAirlines, totalAircraft };
  }
}
