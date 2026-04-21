// domain/interfaces/repositories/IFlightRepository.ts
import { Flight } from '../entities/Flight.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  date: Date;
  passengers?: number;
  cabinClass?: string;
}

export interface IFlightRepository extends IBaseRepository<Flight> {
  search(params: FlightSearchParams): Promise<any[]>;
  findByIdWithRelations(id: string): Promise<any | null>;
  findAllWithRelations(): Promise<any[]>;
  hasReservations(flightId: string): Promise<boolean>;
}
