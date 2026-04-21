// domain/interfaces/repositories/IInvoiceItemRepository.ts
import { InvoiceItem } from '../entities/InvoiceItem.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IInvoiceItemRepository extends IBaseRepository<InvoiceItem> {
  findByInvoice(invoiceId: string): Promise<InvoiceItem[]>;
}
