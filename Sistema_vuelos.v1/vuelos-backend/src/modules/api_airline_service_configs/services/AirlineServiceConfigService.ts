// application/services/AirlineServiceConfigService.ts
import { IAirlineServiceConfigService } from '../interfaces/IAirlineServiceConfigService.js';
import { IAirlineServiceConfigRepository } from '../interfaces/IAirlineServiceConfigRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class AirlineServiceConfigService implements IAirlineServiceConfigService {
  constructor(private readonly repo: IAirlineServiceConfigRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Configuración de servicio', id);
    return item;
  }

  async findByAirline(airlineId: string) { return this.repo.findByAirline(airlineId); }

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
