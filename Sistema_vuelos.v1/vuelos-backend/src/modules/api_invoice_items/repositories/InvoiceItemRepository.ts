// infrastructure/repositories/InvoiceItemRepository.ts
import { PrismaClient } from '@prisma/client';
import { IInvoiceItemRepository } from '../interfaces/IInvoiceItemRepository.js';
import { InvoiceItem } from '../entities/InvoiceItem.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

export class InvoiceItemRepository implements IInvoiceItemRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<InvoiceItem>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.invoiceItem.findMany({ skip, take: limit }),
      this.db.invoiceItem.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<InvoiceItem | null> {
    return this.db.invoiceItem.findUnique({ where: { id } }) as any;
  }

  async findByInvoice(invoiceId: string): Promise<InvoiceItem[]> {
    return this.db.invoiceItem.findMany({ where: { invoiceId } }) as any;
  }

  async create(data: any): Promise<InvoiceItem> {
    return this.db.invoiceItem.create({ data }) as any;
  }

  async update(id: string, data: any): Promise<InvoiceItem> {
    return this.db.invoiceItem.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.invoiceItem.delete({ where: { id } });
  }
}
