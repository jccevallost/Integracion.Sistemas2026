// domain/interfaces/repositories/IAirlineServiceConfigRepository.ts
import { AirlineServiceConfig } from '../entities/AirlineServiceConfig.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IAirlineServiceConfigRepository extends IBaseRepository<AirlineServiceConfig> {
  findByAirline(airlineId: string): Promise<any[]>;
  findByService(serviceId: string): Promise<any[]>;
  findAllWithRelations(): Promise<any[]>;
}
