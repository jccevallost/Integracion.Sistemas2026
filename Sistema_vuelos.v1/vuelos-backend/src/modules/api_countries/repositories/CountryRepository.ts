// infrastructure/repositories/CountryRepository.ts
import { PrismaClient } from '@prisma/client';
import { ICountryRepository } from '../interfaces/ICountryRepository.js';
import { Country } from '../entities/Country.js';
import { CountryMapper } from '../mappers/CountryMapper.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

export class CountryRepository implements ICountryRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<Country>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.country.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
      this.db.country.count(),
    ]);
    return { data: data.map(CountryMapper.toEntity), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<Country | null> {
    const raw = await this.db.country.findUnique({ where: { id } });
    return raw ? CountryMapper.toEntity(raw) : null;
  }

  async findByIsoCode(isoCode: string): Promise<Country | null> {
    const raw = await this.db.country.findUnique({ where: { isoCode } });
    return raw ? CountryMapper.toEntity(raw) : null;
  }

  async create(data: any): Promise<Country> {
    const raw = await this.db.country.create({ data });
    return CountryMapper.toEntity(raw);
  }

  async update(id: string, data: any): Promise<Country> {
    const raw = await this.db.country.update({ where: { id }, data });
    return CountryMapper.toEntity(raw);
  }

  async delete(id: string): Promise<void> {
    await this.db.country.delete({ where: { id } });
  }
}
