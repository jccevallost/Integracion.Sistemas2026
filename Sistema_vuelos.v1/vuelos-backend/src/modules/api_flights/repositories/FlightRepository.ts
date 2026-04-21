// infrastructure/repositories/FlightRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IFlightRepository, FlightSearchParams } from '../interfaces/IFlightRepository.js';
import { Flight } from '../entities/Flight.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const segmentInclude = {
  originAirport: { include: { city: { include: { country: true } } } },
  destinationAirport: { include: { city: { include: { country: true } } } },
  airline: true,
  aircraft: true,
};

const fullInclude = {
  segments: { include: segmentInclude, orderBy: { departureDateTime: 'asc' as const } },
  flightClasses: { orderBy: { basePrice: 'asc' as const } },
};

export class FlightRepository implements IFlightRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<Flight>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.flight.findMany({ skip, take: limit, orderBy: { departureDate: 'asc' } }),
      this.db.flight.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Flight | null> {
    return this.db.flight.findUnique({ where: { id } }) as any;
  }

  async findByIdWithRelations(id: string): Promise<any | null> {
    return this.db.flight.findUnique({ where: { id }, include: fullInclude });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.flight.findMany({ include: fullInclude, orderBy: { departureDate: 'asc' } });
  }

  async search(params: FlightSearchParams): Promise<any[]> {
    const start = new Date(params.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(params.date);
    end.setHours(23, 59, 59, 999);

    return this.db.flight.findMany({
      where: {
        originAirportIata: params.origin,
        destinationAirportIata: params.destination,
        departureDate: { gte: start, lte: end },
        status: { in: ['SCHEDULED', 'DELAYED'] },
      },
      include: {
        segments: { include: segmentInclude, orderBy: { departureDateTime: 'asc' } },
        flightClasses: {
          where: {
            ...(params.cabinClass && { cabinClass: params.cabinClass as any }),
            availableSeats: { gte: params.passengers ?? 1 },
          },
          orderBy: { basePrice: 'asc' },
        },
      },
      orderBy: { departureDate: 'asc' },
    });
  }

  async hasReservations(flightId: string): Promise<boolean> {
    const count = await this.db.reservation.count({ where: { flightId } });
    return count > 0;
  }

  async create(data: any): Promise<Flight> {
    return this.db.flight.create({
      data: {
        originAirportIata: data.originAirportIata.toUpperCase(),
        destinationAirportIata: data.destinationAirportIata.toUpperCase(),
        departureDate: new Date(data.departureDate),
        status: data.status ?? 'SCHEDULED',
        segments: { create: data.segments?.map((s: any) => ({ ...s, departureDateTime: new Date(s.departureDateTime), arrivalDateTime: new Date(s.arrivalDateTime) })) ?? [] },
        flightClasses: { create: data.flightClasses ?? [] },
      },
      include: fullInclude,
    }) as any;
  }

  async update(id: string, data: any): Promise<Flight> {
    return this.db.flight.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.departureDate && { departureDate: new Date(data.departureDate) }),
        ...(data.originAirportIata && { originAirportIata: data.originAirportIata }),
        ...(data.destinationAirportIata && { destinationAirportIata: data.destinationAirportIata }),
      },
      include: fullInclude,
    }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.flight.delete({ where: { id } });
  }
}
