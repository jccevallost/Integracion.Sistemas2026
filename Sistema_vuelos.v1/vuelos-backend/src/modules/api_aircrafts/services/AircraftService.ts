// application/services/AircraftService.ts
import { IAircraftService } from '../interfaces/IAircraftService.js';
import { IAircraftRepository } from '../interfaces/IAircraftRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class AircraftService implements IAircraftService {
  constructor(private readonly repo: IAircraftRepository) {}

  async listAll() { return (await this.repo.findAll()).data; }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Aeronave', id);
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
