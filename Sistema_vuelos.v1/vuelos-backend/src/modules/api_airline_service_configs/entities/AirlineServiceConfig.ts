// domain/entities/AirlineServiceConfig.ts
export class AirlineServiceConfig {
  constructor(
    public readonly id: string,
    public serviceId: string,
    public airlineId: string,
    public originAirportId: string | null,
    public destAirportId: string | null,
    public price: number,
    public currency: string,
  ) {}
}
