// infrastructure/repositories/AirlineRepository.ts
import { PrismaClient } from '@prisma/client';
import { IAirlineRepository } from '../interfaces/IAirlineRepository.js';
import { Airline } from '../entities/Airline.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = { country: true };

export class AirlineRepository implements IAirlineRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 200): Promise<PagedResult<Airline>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.airline.findMany({ skip, take: limit, include, orderBy: { name: 'asc' } }),
      this.db.airline.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Airline | null> {
    return this.db.airline.findUnique({ where: { id } }) as any;
  }

  async findByIataCode(iataCode: string): Promise<Airline | null> {
    return this.db.airline.findUnique({ where: { iataCode } }) as any;
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.airline.findMany({ include, orderBy: { name: 'asc' } });
  }

  async create(data: any): Promise<Airline> {
    return this.db.airline.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<Airline> {
    return this.db.airline.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.airline.delete({ where: { id } });
  }
}
