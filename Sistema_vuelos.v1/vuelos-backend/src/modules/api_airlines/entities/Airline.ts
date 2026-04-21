// domain/entities/Airline.ts
export class Airline {
  constructor(
    public readonly id: string,
    public iataCode: string,
    public name: string,
    public logoUrl: string | null,
    public countryId: string,
  ) {}
}
