// infrastructure/repositories/AirlineAirportRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IAirlineAirportRepository } from '../interfaces/IAirlineAirportRepository.js';
import { AirlineAirport } from '../entities/AirlineAirport.js';

const include = { airline: true, airport: true };

export class AirlineAirportRepository implements IAirlineAirportRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(): Promise<any[]> {
    return this.db.airlineAirport.findMany({ include });
  }

  async findByAirline(airlineId: string): Promise<any[]> {
    return this.db.airlineAirport.findMany({ where: { airlineId }, include });
  }

  async findByAirport(airportId: string): Promise<any[]> {
    return this.db.airlineAirport.findMany({ where: { airportId }, include });
  }

  async create(data: { airlineId: string; airportId: string }): Promise<AirlineAirport> {
    return this.db.airlineAirport.create({ data, include }) as any;
  }

  async delete(airlineId: string, airportId: string): Promise<void> {
    await this.db.airlineAirport.delete({
      where: { airlineId_airportId: { airlineId, airportId } },
    });
  }
}
