// application/mappers/ReservationMapper.ts
import { Reservation } from '../entities/Reservation.js';
import { ReservationResponseDto } from '../dtos/ReservationDto.js';

export class ReservationMapper {
  static toEntity(raw: any): Reservation {
    return new Reservation(
      raw.id,
      raw.userId,
      raw.flightId,
      raw.promotionId ?? null,
      raw.reservationCode,
      Number(raw.totalAmount),
      raw.status,
      raw.createdAt,
    );
  }

  static toDto(raw: any): ReservationResponseDto {
    return {
      id: raw.id,
      reservationCode: raw.reservationCode,
      totalAmount: Number(raw.totalAmount),
      status: raw.status,
      createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
      flight: raw.flight,
      passengers: raw.passengers ?? [],
      promotion: raw.promotion ?? null,
      user: raw.user,
    };
  }

  static toDtoList(raws: any[]): ReservationResponseDto[] {
    return raws.map(this.toDto);
  }
}
