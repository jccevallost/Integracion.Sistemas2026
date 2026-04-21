// domain/entities/ReservationPassenger.ts
export class ReservationPassenger {
  constructor(
    public readonly id: string,
    public reservationId: string,
    public flightClassId: string,
    public firstName: string,
    public lastName: string,
    public documentNumber: string,
    public seatNumber: string | null,
  ) {}
}
