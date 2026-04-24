// application/services/InvoiceService.ts
import { IInvoiceService } from '../interfaces/IInvoiceService.js';
import { IInvoiceRepository } from '../interfaces/IInvoiceRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class InvoiceService implements IInvoiceService {
  constructor(private readonly repo: IInvoiceRepository) {}

  async listAll() { return this.repo.findAllWithRelations(); }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Factura', id);
    return item;
  }

  async findByBillingProfile(billingProfileId: string) {
    return this.repo.findByBillingProfile(billingProfileId);
  }

  async findByPayment(paymentId: string) {
    return this.repo.findByPayment(paymentId);
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
