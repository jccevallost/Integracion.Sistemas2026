// domain/interfaces/repositories/ICountryRepository.ts
import { Country } from '../entities/Country.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface ICountryRepository extends IBaseRepository<Country> {
  findByIsoCode(isoCode: string): Promise<Country | null>;
}
