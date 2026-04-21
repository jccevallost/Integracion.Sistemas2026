// domain/interfaces/repositories/IServiceCatalogRepository.ts
import { ServiceCatalog } from '../entities/ServiceCatalog.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IServiceCatalogRepository extends IBaseRepository<ServiceCatalog> {
  findByCode(code: string): Promise<ServiceCatalog | null>;
  findByCategory(category: string): Promise<ServiceCatalog[]>;
}
