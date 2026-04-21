// application/services/InvoiceItemService.ts
import { IInvoiceItemService } from '../interfaces/IInvoiceItemService.js';
import { IInvoiceItemRepository } from '../interfaces/IInvoiceItemRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class InvoiceItemService implements IInvoiceItemService {
  constructor(private readonly repo: IInvoiceItemRepository) {}

  async listAll() { return (await this.repo.findAll()).data; }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Ítem de factura', id);
    return item;
  }

  async findByInvoice(invoiceId: string) { return this.repo.findByInvoice(invoiceId); }

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
