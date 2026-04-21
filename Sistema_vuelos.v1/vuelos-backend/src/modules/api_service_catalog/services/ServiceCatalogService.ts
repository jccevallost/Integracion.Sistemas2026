// application/services/ServiceCatalogService.ts
import { IServiceCatalogService } from '../interfaces/IServiceCatalogService.js';
import { IServiceCatalogRepository } from '../interfaces/IServiceCatalogRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class ServiceCatalogService implements IServiceCatalogService {
  constructor(private readonly repo: IServiceCatalogRepository) {}

  async listAll() { return (await this.repo.findAll()).data; }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Servicio', id);
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
