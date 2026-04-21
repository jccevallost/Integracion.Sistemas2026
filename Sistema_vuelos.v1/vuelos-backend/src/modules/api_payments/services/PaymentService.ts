// application/services/PaymentService.ts
import { IPaymentService } from '../interfaces/IPaymentService.js';
import { IPaymentRepository } from '../interfaces/IPaymentRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class PaymentService implements IPaymentService {
  constructor(private readonly repo: IPaymentRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Pago', id);
    return item;
  }

  async findByReservation(reservationId: string) { return this.repo.findByReservation(reservationId); }

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
