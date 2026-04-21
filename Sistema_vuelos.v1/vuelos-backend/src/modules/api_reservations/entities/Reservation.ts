// domain/entities/Reservation.ts
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export class Reservation {
  constructor(
    public readonly id: string,
    public userId: string,
    public flightId: string,
    public promotionId: string | null,
    public reservationCode: string,
    public totalAmount: number,
    public status: ReservationStatus,
    public readonly createdAt: Date,
  ) {}

  isCancellable(): boolean {
    return this.status === 'PENDING' || this.status === 'CONFIRMED';
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }
}
