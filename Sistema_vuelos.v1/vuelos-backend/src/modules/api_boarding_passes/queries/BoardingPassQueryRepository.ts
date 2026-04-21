// infrastructure/queries/BoardingPassQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class BoardingPassQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, byStatus] = await Promise.all([
      this.db.boardingPass.count(),
      this.db.boardingPass.groupBy({ by: ['status'], _count: { id: true } }),
    ]);
    return { total, byStatus };
  }

  async findByPassenger(passengerId: string) {
    return this.db.boardingPass.findMany({
      where: { passengerId },
      include: {
        passenger: true,
        segment: { include: { originAirport: true, destinationAirport: true, airline: true } },
      },
    });
  }

  async findAll() {
    return this.db.boardingPass.findMany({
      include: {
        passenger: true,
        segment: { include: { originAirport: true, destinationAirport: true } },
      },
      orderBy: { status: 'asc' },
    });
  }
}
