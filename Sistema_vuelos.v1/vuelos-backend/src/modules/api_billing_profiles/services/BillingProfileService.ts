// application/services/BillingProfileService.ts
import { IBillingProfileService } from '../interfaces/IBillingProfileService.js';
import { IBillingProfileRepository } from '../interfaces/IBillingProfileRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class BillingProfileService implements IBillingProfileService {
  constructor(private readonly repo: IBillingProfileRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Perfil de facturación', id);
    return item;
  }

  async findByUser(userId: string) { return this.repo.findByUser(userId); }

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
