// domain/interfaces/repositories/IFlightClassRepository.ts
import { FlightClass } from '../entities/FlightClass.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IFlightClassRepository extends IBaseRepository<FlightClass> {
  findByFlightId(flightId: string): Promise<FlightClass[]>;
  decrementSeats(id: string, count: number): Promise<void>;
  incrementSeats(id: string, count: number): Promise<void>;
}
