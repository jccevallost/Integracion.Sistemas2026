// infrastructure/repositories/PassengerServiceRepository.ts
import type { PrismaClient } from '@prisma/client';
import { IPassengerServiceRepository } from '../interfaces/IPassengerServiceRepository.js';
import { PassengerService } from '../entities/PassengerService.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = {
  passenger: true,
  serviceConfig: { include: { service: true } },
};

export class PassengerServiceRepository implements IPassengerServiceRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<PassengerService>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.passengerService.findMany({ skip, take: limit, include }),
      this.db.passengerService.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<PassengerService | null> {
    return this.db.passengerService.findUnique({ where: { id }, include }) as any;
  }

  async findByPassenger(passengerId: string): Promise<any[]> {
    return this.db.passengerService.findMany({ where: { passengerId }, include });
  }

  async findByServiceConfig(serviceConfigId: string): Promise<any[]> {
    return this.db.passengerService.findMany({ where: { serviceConfigId }, include });
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.passengerService.findMany({ include });
  }

  async create(data: any): Promise<PassengerService> {
    return this.db.passengerService.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<PassengerService> {
    return this.db.passengerService.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.passengerService.delete({ where: { id } });
  }
}
