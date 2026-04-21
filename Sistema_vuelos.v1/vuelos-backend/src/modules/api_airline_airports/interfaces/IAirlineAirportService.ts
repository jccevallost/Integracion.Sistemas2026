// domain/interfaces/services/IAirlineAirportService.ts
export interface IAirlineAirportService {
  listAll(): Promise<any[]>;
  findByAirline(airlineId: string): Promise<any[]>;
  findByAirport(airportId: string): Promise<any[]>;
  create(data: { airlineId: string; airportId: string }): Promise<any>;
  remove(airlineId: string, airportId: string): Promise<void>;
}
