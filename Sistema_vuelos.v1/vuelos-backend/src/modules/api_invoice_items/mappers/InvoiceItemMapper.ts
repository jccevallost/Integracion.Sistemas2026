// application/mappers/InvoiceItemMapper.ts
import { InvoiceItem } from '../entities/InvoiceItem.js';
import { InvoiceItemResponseDto } from '../dtos/InvoiceItemDto.js';

export class InvoiceItemMapper {
  static toEntity(raw: any): InvoiceItem {
    return new InvoiceItem(
      raw.id,
      raw.invoiceId,
      raw.description,
      raw.quantity,
      Number(raw.unitPrice),
      Number(raw.totalPrice),
    );
  }

  static toDto(raw: any): InvoiceItemResponseDto {
    return {
      id: raw.id,
      invoiceId: raw.invoiceId,
      description: raw.description,
      quantity: raw.quantity,
      unitPrice: Number(raw.unitPrice),
      totalPrice: Number(raw.totalPrice),
    };
  }

  static toDtoList(raws: any[]): InvoiceItemResponseDto[] {
    return raws.map(this.toDto);
  }
}
