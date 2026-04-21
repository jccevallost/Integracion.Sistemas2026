// infrastructure/queries/PassengerServiceQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class PassengerServiceQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, totalRevenue] = await Promise.all([
      this.db.passengerService.count(),
      this.db.passengerService.aggregate({ _sum: { unitPriceAtBooking: true } }),
    ]);
    return { total, totalRevenue: Number(totalRevenue._sum.unitPriceAtBooking ?? 0) };
  }

  async findByPassenger(passengerId: string) {
    return this.db.passengerService.findMany({
      where: { passengerId },
      include: { passenger: true, serviceConfig: { include: { service: true } } },
    });
  }

  async findAll() {
    return this.db.passengerService.findMany({
      include: { passenger: true, serviceConfig: { include: { service: true } } },
    });
  }
}
