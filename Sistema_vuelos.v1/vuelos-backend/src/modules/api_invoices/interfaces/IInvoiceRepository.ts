// domain/interfaces/repositories/IInvoiceRepository.ts
import { Invoice } from '../entities/Invoice.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IInvoiceRepository extends IBaseRepository<Invoice> {
  findByPayment(paymentId: string): Promise<Invoice | null>;
  findByBillingProfile(billingProfileId: string): Promise<any[]>;
  findByNumber(invoiceNumber: string): Promise<Invoice | null>;
  findAllWithRelations(): Promise<any[]>;
}
