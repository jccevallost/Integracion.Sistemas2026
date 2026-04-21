// application/mappers/PaymentMapper.ts
import { Payment } from '../entities/Payment.js';
import { PaymentResponseDto } from '../dtos/PaymentDto.js';

export class PaymentMapper {
  static toEntity(raw: any): Payment {
    return new Payment(
      raw.id,
      raw.reservationId,
      Number(raw.amount),
      raw.provider,
      raw.transactionId,
      raw.status,
      raw.createdAt,
    );
  }

  static toDto(raw: any): PaymentResponseDto {
    return {
      id: raw.id,
      reservationId: raw.reservationId,
      amount: Number(raw.amount),
      provider: raw.provider,
      transactionId: raw.transactionId,
      status: raw.status,
      createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
      reservation: raw.reservation
        ? { id: raw.reservation.id, reservationCode: raw.reservation.reservationCode, totalAmount: Number(raw.reservation.totalAmount) }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): PaymentResponseDto[] {
    return raws.map(this.toDto);
  }
}
