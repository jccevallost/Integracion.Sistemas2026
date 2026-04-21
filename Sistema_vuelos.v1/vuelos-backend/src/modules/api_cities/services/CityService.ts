// application/services/CityService.ts
import { ICityService } from '../interfaces/ICityService.js';
import { ICityRepository } from '../interfaces/ICityRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class CityService implements ICityService {
  constructor(private readonly repo: ICityRepository) {}

  async listAll() { return (await this.repo.findAll()).data; }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Ciudad', id);
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
