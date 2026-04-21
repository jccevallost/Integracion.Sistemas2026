// domain/interfaces/repositories/IPassengerServiceRepository.ts
import { PassengerService } from '../entities/PassengerService.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IPassengerServiceRepository extends IBaseRepository<PassengerService> {
  findByPassenger(passengerId: string): Promise<any[]>;
  findByServiceConfig(serviceConfigId: string): Promise<any[]>;
  findAllWithRelations(): Promise<any[]>;
}
