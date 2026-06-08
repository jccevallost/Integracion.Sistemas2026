// infrastructure/queries/PassengerServiceQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class PassengerServiceQueryRepository {
  constructor(
    private readonly db: PrismaClient,
    private readonly options: { includeServiceConfig?: boolean } = {},
  ) {}

  private relationInclude() {
    if (this.options.includeServiceConfig === false) return { passenger: true };
    return { passenger: true, serviceConfig: { include: { service: true } } };
  }

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
      include: this.relationInclude(),
    });
  }

  async findAll() {
    return this.db.passengerService.findMany({
      include: this.relationInclude(),
    });
  }
}
