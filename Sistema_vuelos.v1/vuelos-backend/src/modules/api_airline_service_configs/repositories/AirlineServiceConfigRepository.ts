// infrastructure/repositories/AirlineServiceConfigRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IAirlineServiceConfigRepository } from '../interfaces/IAirlineServiceConfigRepository.js';
import { AirlineServiceConfig } from '../entities/AirlineServiceConfig.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = {
  service: true,
  airline: true,
  originAirport: true,
  destAirport: true,
};

export class AirlineServiceConfigRepository implements IAirlineServiceConfigRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<AirlineServiceConfig>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.airlineServiceConfig.findMany({ skip, take: limit, include }),
      this.db.airlineServiceConfig.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<AirlineServiceConfig | null> {
    return this.db.airlineServiceConfig.findUnique({ where: { id }, include }) as any;
  }

  async findByAirline(airlineId: string): Promise<any[]> {
    return this.db.airlineServiceConfig.findMany({ where: { airlineId }, include });
  }

  async findByService(serviceId: string): Promise<any[]> {
    return this.db.airlineServiceConfig.findMany({ where: { serviceId }, include });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.airlineServiceConfig.findMany({ include });
  }

  async create(data: any): Promise<AirlineServiceConfig> {
    return this.db.airlineServiceConfig.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<AirlineServiceConfig> {
    return this.db.airlineServiceConfig.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.airlineServiceConfig.delete({ where: { id } });
  }
}
