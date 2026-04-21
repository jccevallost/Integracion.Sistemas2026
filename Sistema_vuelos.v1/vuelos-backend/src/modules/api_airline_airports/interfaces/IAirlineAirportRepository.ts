// domain/interfaces/repositories/IAirlineAirportRepository.ts
import { AirlineAirport } from '../entities/AirlineAirport.js';

export interface IAirlineAirportRepository {
  findAll(): Promise<any[]>;
  findByAirline(airlineId: string): Promise<any[]>;
  findByAirport(airportId: string): Promise<any[]>;
  create(data: { airlineId: string; airportId: string }): Promise<AirlineAirport>;
  delete(airlineId: string, airportId: string): Promise<void>;
}
