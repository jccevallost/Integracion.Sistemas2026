// application/services/SegmentService.ts
import { ISegmentService } from '../interfaces/ISegmentService.js';
import { ISegmentRepository } from '../interfaces/ISegmentRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class SegmentService implements ISegmentService {
  constructor(private readonly repo: ISegmentRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Segmento', id);
    return item;
  }

  async findByFlight(flightId: string) { return this.repo.findByFlight(flightId); }

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
