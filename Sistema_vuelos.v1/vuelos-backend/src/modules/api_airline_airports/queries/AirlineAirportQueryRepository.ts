// infrastructure/queries/AirlineAirportQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class AirlineAirportQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, airlines, airports] = await Promise.all([
      this.db.airlineAirport.count(),
      this.db.airline.count(),
      this.db.airport.count(),
    ]);
    return { totalRelations: total, totalAirlines: airlines, totalAirports: airports };
  }

  async findAll() {
    return this.db.airlineAirport.findMany({
      include: { airline: true, airport: true },
      orderBy: { airline: { name: 'asc' } },
    });
  }

  async findByAirline(airlineId: string) {
    return this.db.airlineAirport.findMany({
      where: { airlineId },
      include: { airline: true, airport: true },
    });
  }

  async findByAirport(airportId: string) {
    return this.db.airlineAirport.findMany({
      where: { airportId },
      include: { airline: true, airport: true },
    });
  }
}
