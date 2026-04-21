// application/services/PassengerServiceService.ts
import { IPassengerServiceService } from '../interfaces/IPassengerServiceService.js';
import { IPassengerServiceRepository } from '../interfaces/IPassengerServiceRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class PassengerServiceService implements IPassengerServiceService {
  constructor(private readonly repo: IPassengerServiceRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Servicio de pasajero', id);
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
