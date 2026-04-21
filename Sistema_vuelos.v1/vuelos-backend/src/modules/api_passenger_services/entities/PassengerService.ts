// domain/entities/PassengerService.ts
export class PassengerService {
  constructor(
    public readonly id: string,
    public passengerId: string,
    public serviceConfigId: string,
    public quantity: number,
    public unitPriceAtBooking: number,
  ) {}

  get totalPrice(): number {
    return this.unitPriceAtBooking * this.quantity;
  }
}
