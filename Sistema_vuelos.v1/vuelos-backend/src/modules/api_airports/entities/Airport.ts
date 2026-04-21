// domain/entities/Airport.ts
export class Airport {
  constructor(
    public readonly id: string,
    public iataCode: string,
    public name: string,
    public cityId: string,
    public timezone: string,
  ) {}
}
