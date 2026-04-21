// application/services/AirlineService.ts
import { IAirlineService } from '../interfaces/IAirlineService.js';
import { IAirlineRepository } from '../interfaces/IAirlineRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class AirlineService implements IAirlineService {
  constructor(private readonly repo: IAirlineRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Aerolínea', id);
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
