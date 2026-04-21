// infrastructure/repositories/AircraftRepository.ts
import { PrismaClient } from '@prisma/client';
import { IAircraftRepository } from '../interfaces/IAircraftRepository.js';
import { Aircraft } from '../entities/Aircraft.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = { airline: true };

export class AircraftRepository implements IAircraftRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 200): Promise<PagedResult<Aircraft>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.aircraft.findMany({ skip, take: limit, include, orderBy: { modelName: 'asc' } }),
      this.db.aircraft.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Aircraft | null> {
    return this.db.aircraft.findUnique({ where: { id } }) as any;
  }

  async findByAirlineId(airlineId: string): Promise<Aircraft[]> {
    return this.db.aircraft.findMany({ where: { airlineId }, include }) as any;
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.aircraft.findMany({ include, orderBy: { modelName: 'asc' } });
  }

  async create(data: any): Promise<Aircraft> {
    return this.db.aircraft.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<Aircraft> {
    return this.db.aircraft.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.aircraft.delete({ where: { id } });
  }
}
