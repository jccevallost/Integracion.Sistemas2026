// application/services/AirportService.ts
import { IAirportService } from '../interfaces/IAirportService.js';
import { IAirportRepository } from '../interfaces/IAirportRepository.js';
import { AirportQueryRepository } from '../queries/AirportQueryRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class AirportService implements IAirportService {
  constructor(
    private readonly repo: IAirportRepository,
    private readonly query: AirportQueryRepository,
  ) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Aeropuerto', id);
    return item;
  }

  async search(q: string) { return this.query.searchByName(q); }

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
