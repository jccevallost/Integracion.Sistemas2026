// domain/entities/Flight.ts
export type FlightStatus = 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED';

export class Flight {
  constructor(
    public readonly id: string,
    public originAirportIata: string,
    public destinationAirportIata: string,
    public departureDate: Date,
    public status: FlightStatus,
  ) {}

  isAvailable(): boolean {
    return this.status === 'SCHEDULED' || this.status === 'DELAYED';
  }
}
