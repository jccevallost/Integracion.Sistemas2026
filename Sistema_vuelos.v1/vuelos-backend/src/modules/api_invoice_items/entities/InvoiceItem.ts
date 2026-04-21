// domain/entities/InvoiceItem.ts
export class InvoiceItem {
  constructor(
    public readonly id: string,
    public invoiceId: string,
    public description: string,
    public quantity: number,
    public unitPrice: number,
    public totalPrice: number,
  ) {}
}
