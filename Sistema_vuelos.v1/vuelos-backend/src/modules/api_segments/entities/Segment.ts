// domain/entities/Segment.ts
export class Segment {
  constructor(
    public readonly id: string,
    public segmentNumber: string,
    public originAirportId: string,
    public destinationAirportId: string,
    public departureDateTime: Date,
    public arrivalDateTime: Date,
    public airlineId: string,
    public aircraftId: string | null,
    public estimatedDuration: number,
    public flightId: string | null,
  ) {}

  getDurationMinutes(): number {
    return Math.floor(
      (this.arrivalDateTime.getTime() - this.departureDateTime.getTime()) / 60000,
    );
  }
}
