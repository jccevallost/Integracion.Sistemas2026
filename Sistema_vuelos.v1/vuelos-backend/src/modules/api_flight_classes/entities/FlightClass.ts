// domain/entities/FlightClass.ts
export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

export class FlightClass {
  constructor(
    public readonly id: string,
    public flightId: string,
    public cabinClass: CabinClass,
    public availableSeats: number,
    public basePrice: number,
  ) {}

  hasAvailability(requiredSeats = 1): boolean {
    return this.availableSeats >= requiredSeats;
  }

  calculateTotal(passengers: number): number {
    return this.basePrice * passengers;
  }
}
