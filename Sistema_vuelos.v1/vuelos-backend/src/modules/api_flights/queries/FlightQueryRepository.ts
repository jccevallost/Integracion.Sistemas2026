// infrastructure/queries/FlightQueryRepository.ts
// Queries complejas de vuelos separadas del repositorio principal (CQRS lite)
import type { PrismaClient } from '@prisma/client';

export class FlightQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getFlightStats() {
    const [total, scheduled, delayed, cancelled, completed] = await Promise.all([
      this.db.flight.count(),
      this.db.flight.count({ where: { status: 'SCHEDULED' } }),
      this.db.flight.count({ where: { status: 'DELAYED' } }),
      this.db.flight.count({ where: { status: 'CANCELLED' } }),
      this.db.flight.count({ where: { status: 'COMPLETED' } }),
    ]);
    return { total, scheduled, delayed, cancelled, completed };
  }

  async getUpcomingFlights(limit = 10) {
    return this.db.flight.findMany({
      where: {
        departureDate: { gte: new Date() },
        status: { in: ['SCHEDULED', 'DELAYED'] },
      },
      include: {
        segments: { include: { airline: true }, orderBy: { departureDateTime: 'asc' } },
        flightClasses: { orderBy: { basePrice: 'asc' } },
      },
      orderBy: { departureDate: 'asc' },
      take: limit,
    });
  }

  async getFlightsByRoute(origin: string, destination: string) {
    return this.db.flight.findMany({
      where: {
        originAirportIata: origin.toUpperCase(),
        destinationAirportIata: destination.toUpperCase(),
      },
      include: {
        flightClasses: { orderBy: { basePrice: 'asc' } },
      },
      orderBy: { departureDate: 'asc' },
    });
  }
}
