// application/dtos/InvoiceItemDto.ts
export interface CreateInvoiceItemDto {
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface UpdateInvoiceItemDto {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface InvoiceItemResponseDto {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
