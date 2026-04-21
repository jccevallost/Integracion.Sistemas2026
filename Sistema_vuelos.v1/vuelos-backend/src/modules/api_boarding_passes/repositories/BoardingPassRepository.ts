// infrastructure/repositories/BoardingPassRepository.ts
import { PrismaClient } from '@prisma/client';
import { IBoardingPassRepository } from '../interfaces/IBoardingPassRepository.js';
import { BoardingPass } from '../entities/BoardingPass.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

const include = {
  passenger: true,
  segment: {
    include: {
      originAirport: true,
      destinationAirport: true,
      airline: true,
    },
  },
};

export class BoardingPassRepository implements IBoardingPassRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<BoardingPass>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.boardingPass.findMany({ skip, take: limit, include }),
      this.db.boardingPass.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<BoardingPass | null> {
    return this.db.boardingPass.findUnique({ where: { id }, include }) as any;
  }

  async findByPassenger(passengerId: string): Promise<any[]> {
    return this.db.boardingPass.findMany({ where: { passengerId }, include });
  }

  async findBySegment(segmentId: string): Promise<any[]> {
    return this.db.boardingPass.findMany({ where: { segmentId }, include });
  }

  async findByCode(boardingCode: string): Promise<BoardingPass | null> {
    return this.db.boardingPass.findFirst({ where: { boardingCode }, include }) as any;
  }

  async findAllWithRelations(): Promise<any[]> {
    return this.db.boardingPass.findMany({ include });
  }

  async create(data: any): Promise<BoardingPass> {
    return this.db.boardingPass.create({ data, include }) as any;
  }

  async update(id: string, data: any): Promise<BoardingPass> {
    return this.db.boardingPass.update({ where: { id }, data, include }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.boardingPass.delete({ where: { id } });
  }
}
