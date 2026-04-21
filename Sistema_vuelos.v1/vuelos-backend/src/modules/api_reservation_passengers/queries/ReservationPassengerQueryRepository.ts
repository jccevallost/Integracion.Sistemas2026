// infrastructure/queries/ReservationPassengerQueryRepository.ts
import type { PrismaClient } from '@prisma/client';

export class ReservationPassengerQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, withSeat] = await Promise.all([
      this.db.reservationPassenger.count(),
      this.db.reservationPassenger.count({ where: { seatNumber: { not: null } } }),
    ]);
    return { total, withSeat, withoutSeat: total - withSeat };
  }

  async findByReservation(reservationId: string) {
    return this.db.reservationPassenger.findMany({
      where: { reservationId },
      include: {
        reservation: { select: { id: true, reservationCode: true } },
        flightClass: true,
        extraServices: { include: { serviceConfig: { include: { service: true } } } },
        boardingPasses: true,
      },
    });
  }

  async findAll() {
    return this.db.reservationPassenger.findMany({
      include: {
        reservation: { select: { id: true, reservationCode: true } },
        flightClass: true,
      },
      orderBy: { lastName: 'asc' },
    });
  }
}
