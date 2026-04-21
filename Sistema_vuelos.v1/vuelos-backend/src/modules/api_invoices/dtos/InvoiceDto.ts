// application/dtos/InvoiceDto.ts
export interface CreateInvoiceDto {
  paymentId: string;
  billingProfileId: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface InvoiceResponseDto {
  id: string;
  paymentId: string;
  billingProfileId: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  payment?: { id: string; amount: number; provider: string; status: string };
  billingProfile?: { id: string; businessName: string; taxId: string };
  items?: any[];
}
