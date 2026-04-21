// infrastructure/repositories/CityRepository.ts
import type { PrismaClient } from '@prisma/client';
import { ICityRepository } from '../interfaces/ICityRepository.js';
import { City } from '../entities/City.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = { country: true };

export class CityRepository implements ICityRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 200): Promise<PagedResult<City>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.city.findMany({ skip, take: limit, include, orderBy: { name: 'asc' } }),
      this.db.city.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<City | null> {
    return this.db.city.findUnique({ where: { id }, include }) as any;
  }

  async findByCountryId(countryId: string): Promise<City[]> {
    return this.db.city.findMany({ where: { countryId }, include }) as any;
  }

  async create(data: any): Promise<City> {
    return this.db.city.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<City> {
    return this.db.city.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.city.delete({ where: { id } });
  }
}
