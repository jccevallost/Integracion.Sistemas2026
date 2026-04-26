// domain/interfaces/repositories/IPromotionRepository.ts
import { Promotion } from '../entities/Promotion.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IPromotionRepository extends IBaseRepository<Promotion> {
  findByCode(code: string): Promise<Promotion | null>;
  incrementUsage(id: string): Promise<void>;
  decrementUsage(id: string): Promise<void>;
}
