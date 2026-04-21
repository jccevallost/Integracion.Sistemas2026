// domain/interfaces/repositories/IAirportRepository.ts
import { Airport } from '../entities/Airport.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IAirportRepository extends IBaseRepository<Airport> {
  findByIataCode(iataCode: string): Promise<Airport | null>;
  findWithRelations(id: string): Promise<any | null>;
  findAllWithRelations(): Promise<any[]>;
}
