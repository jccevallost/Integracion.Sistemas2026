// infrastructure/repositories/AirportRepository.ts
import { PrismaClient } from '@prisma/client';
import { IAirportRepository } from '../interfaces/IAirportRepository.js';
import { Airport } from '../entities/Airport.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = { city: { include: { country: true } } };

export class AirportRepository implements IAirportRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 200): Promise<PagedResult<Airport>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.airport.findMany({ skip, take: limit, include, orderBy: { iataCode: 'asc' } }),
      this.db.airport.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Airport | null> {
    return this.db.airport.findUnique({ where: { id } }) as any;
  }

  async findWithRelations(id: string): Promise<any | null> {
    return this.db.airport.findUnique({ where: { id }, include });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.airport.findMany({ include, orderBy: { iataCode: 'asc' } });
  }

  async findByIataCode(iataCode: string): Promise<Airport | null> {
    return this.db.airport.findUnique({ where: { iataCode } }) as any;
  }

  async create(data: any): Promise<Airport> {
    return this.db.airport.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<Airport> {
    return this.db.airport.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.airport.delete({ where: { id } });
  }
}
