// infrastructure/repositories/SegmentRepository.ts
import type { PrismaClient } from '@prisma/client';
import { ISegmentRepository } from '../interfaces/ISegmentRepository.js';
import { Segment } from '../entities/Segment.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = {
  originAirport: true,
  destinationAirport: true,
  airline: true,
  aircraft: true,
};

export class SegmentRepository implements ISegmentRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<Segment>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.segment.findMany({ skip, take: limit, include, orderBy: { departureDateTime: 'asc' } }),
      this.db.segment.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<Segment | null> {
    return this.db.segment.findUnique({ where: { id }, include }) as any;
  }

  async findByFlight(flightId: string): Promise<any[]> {
    return this.db.segment.findMany({ where: { flightId }, include, orderBy: { departureDateTime: 'asc' } });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.segment.findMany({ include, orderBy: { departureDateTime: 'asc' } });
  }

  async create(data: any): Promise<Segment> {
    return this.db.segment.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<Segment> {
    return this.db.segment.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.segment.delete({ where: { id } });
  }
}
