// application/mappers/InvoiceMapper.ts
import { Invoice } from '../entities/Invoice.js';
import { InvoiceResponseDto } from '../dtos/InvoiceDto.js';

export class InvoiceMapper {
  static toEntity(raw: any): Invoice {
    return new Invoice(
      raw.id,
      raw.paymentId,
      raw.billingProfileId,
      raw.invoiceNumber,
      Number(raw.subtotal),
      Number(raw.taxAmount),
      Number(raw.total),
      raw.createdAt,
    );
  }

  static toDto(raw: any): InvoiceResponseDto {
    return {
      id: raw.id,
      paymentId: raw.paymentId,
      billingProfileId: raw.billingProfileId,
      invoiceNumber: raw.invoiceNumber,
      subtotal: Number(raw.subtotal),
      taxAmount: Number(raw.taxAmount),
      total: Number(raw.total),
      createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
      payment: raw.payment
        ? { id: raw.payment.id, amount: Number(raw.payment.amount), provider: raw.payment.provider, status: raw.payment.status }
        : undefined,
      billingProfile: raw.billingProfile
        ? { id: raw.billingProfile.id, businessName: raw.billingProfile.businessName, taxId: raw.billingProfile.taxId }
        : undefined,
      items: raw.items ?? [],
    };
  }

  static toDtoList(raws: any[]): InvoiceResponseDto[] {
    return raws.map(this.toDto);
  }
}
