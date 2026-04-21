// domain/entities/City.ts
export class City {
  constructor(
    public readonly id: string,
    public name: string,
    public countryId: string,
    public iataCode: string | null,
  ) {}
}
