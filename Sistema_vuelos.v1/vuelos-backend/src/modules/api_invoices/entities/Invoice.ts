// domain/entities/Invoice.ts
export class Invoice {
  constructor(
    public readonly id: string,
    public paymentId: string,
    public billingProfileId: string,
    public invoiceNumber: string,
    public subtotal: number,
    public taxAmount: number,
    public total: number,
    public readonly createdAt: Date,
  ) {}
}
