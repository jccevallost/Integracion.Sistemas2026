// application/services/CountryService.ts
import { ICountryService } from '../interfaces/ICountryService.js';
import { ICountryRepository } from '../interfaces/ICountryRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class CountryService implements ICountryService {
  constructor(private readonly repo: ICountryRepository) {}

  async listAll() { return (await this.repo.findAll()).data; }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('País', id);
    return item;
  }

  async create(data: any) { return this.repo.create(data); }

  async update(id: string, data: any) {
    await this.getById(id);
    return this.repo.update(id, data);
  }

  async remove(id: string) {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
