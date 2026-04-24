// domain/interfaces/services/IInvoiceService.ts
export interface IInvoiceService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByBillingProfile(billingProfileId: string): Promise<any[]>;
  findByPayment(paymentId: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
