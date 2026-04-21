// domain/interfaces/services/IInvoiceItemService.ts
export interface IInvoiceItemService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByInvoice(invoiceId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
