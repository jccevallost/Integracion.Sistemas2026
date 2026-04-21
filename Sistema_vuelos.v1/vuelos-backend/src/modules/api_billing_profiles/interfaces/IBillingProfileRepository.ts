// domain/interfaces/repositories/IBillingProfileRepository.ts
import { BillingProfile } from '../entities/BillingProfile.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IBillingProfileRepository extends IBaseRepository<BillingProfile> {
  findByUser(userId: string): Promise<any[]>;
  findDefaultByUser(userId: string): Promise<BillingProfile | null>;
  findAllWithRelations(): Promise<any[]>;
}
