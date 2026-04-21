// domain/interfaces/repositories/IAirlineRepository.ts
import { Airline } from '../entities/Airline.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IAirlineRepository extends IBaseRepository<Airline> {
  findByIataCode(iataCode: string): Promise<Airline | null>;
  findAllWithRelations(): Promise<any[]>;
}
