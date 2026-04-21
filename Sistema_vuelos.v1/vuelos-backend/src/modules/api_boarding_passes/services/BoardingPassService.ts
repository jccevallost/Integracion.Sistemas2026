// application/services/BoardingPassService.ts
import { IBoardingPassService } from '../interfaces/IBoardingPassService.js';
import { IBoardingPassRepository } from '../interfaces/IBoardingPassRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class BoardingPassService implements IBoardingPassService {
  constructor(private readonly repo: IBoardingPassRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Pase de abordar', id);
    return item;
  }

  async findByPassenger(passengerId: string) { return this.repo.findByPassenger(passengerId); }

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
