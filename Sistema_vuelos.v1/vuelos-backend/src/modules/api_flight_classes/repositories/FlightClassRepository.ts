// infrastructure/repositories/FlightClassRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IFlightClassRepository } from '../interfaces/IFlightClassRepository.js';
import { FlightClass } from '../entities/FlightClass.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

export class FlightClassRepository implements IFlightClassRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 200): Promise<PagedResult<FlightClass>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.flightClass.findMany({ skip, take: limit }),
      this.db.flightClass.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<FlightClass | null> {
    const raw = await this.db.flightClass.findUnique({
      where: { id },
      include: { flight: true },
    });
    if (!raw) return null;
    return new FlightClass(raw.id, raw.flightId, raw.cabinClass, raw.availableSeats, Number(raw.basePrice));
  }

  async findByFlightId(flightId: string): Promise<FlightClass[]> {
    const raws = await this.db.flightClass.findMany({ where: { flightId } });
    return raws.map(r => new FlightClass(r.id, r.flightId, r.cabinClass, r.availableSeats, Number(r.basePrice)));
  }

  async decrementSeats(id: string, count: number): Promise<void> {
    await this.db.flightClass.update({
      where: { id },
      data: { availableSeats: { decrement: count } },
    });
  }

  async incrementSeats(id: string, count: number): Promise<void> {
    await this.db.flightClass.update({
      where: { id },
      data: { availableSeats: { increment: count } },
    });
  }

  async decrementSeatsAtomic(id: string, count: number): Promise<boolean> {
    const result = await this.db.flightClass.updateMany({
      where: { id, availableSeats: { gte: count } },
      data:  { availableSeats: { decrement: count } },
    });
    return result.count === 1;
  }

  async create(data: any): Promise<FlightClass> {
    return this.db.flightClass.create({ data }) as any;
  }

  async update(id: string, data: any): Promise<FlightClass> {
    return this.db.flightClass.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.flightClass.delete({ where: { id } });
  }
}
