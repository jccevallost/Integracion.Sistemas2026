// domain/interfaces/repositories/IAircraftRepository.ts
import { Aircraft } from '../entities/Aircraft.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IAircraftRepository extends IBaseRepository<Aircraft> {
  findByAirlineId(airlineId: string): Promise<Aircraft[]>;
  findAllWithRelations(): Promise<any[]>;
}
