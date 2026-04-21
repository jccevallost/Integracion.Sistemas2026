// domain/interfaces/repositories/ICityRepository.ts
import { City } from '../entities/City.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface ICityRepository extends IBaseRepository<City> {
  findByCountryId(countryId: string): Promise<City[]>;
}
