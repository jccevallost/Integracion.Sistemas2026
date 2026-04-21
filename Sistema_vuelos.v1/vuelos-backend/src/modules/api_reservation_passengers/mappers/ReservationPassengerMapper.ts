// application/mappers/ReservationPassengerMapper.ts
import { ReservationPassenger } from '../entities/ReservationPassenger.js';
import { ReservationPassengerResponseDto } from '../dtos/ReservationPassengerDto.js';

export class ReservationPassengerMapper {
  static toEntity(raw: any): ReservationPassenger {
    return new ReservationPassenger(
      raw.id,
      raw.reservationId,
      raw.flightClassId,
      raw.firstName,
      raw.lastName,
      raw.documentNumber,
      raw.seatNumber ?? null,
    );
  }

  static toDto(raw: any): ReservationPassengerResponseDto {
    return {
      id: raw.id,
      reservationId: raw.reservationId,
      flightClassId: raw.flightClassId,
      firstName: raw.firstName,
      lastName: raw.lastName,
      documentNumber: raw.documentNumber,
      seatNumber: raw.seatNumber ?? null,
      reservation: raw.reservation
        ? { id: raw.reservation.id, reservationCode: raw.reservation.reservationCode }
        : undefined,
      flightClass: raw.flightClass
        ? { id: raw.flightClass.id, cabinClass: raw.flightClass.cabinClass, basePrice: Number(raw.flightClass.basePrice) }
        : undefined,
      services: raw.services ?? [],
      boardingPasses: raw.boardingPasses ?? [],
    };
  }

  static toDtoList(raws: any[]): ReservationPassengerResponseDto[] {
    return raws.map(this.toDto);
  }
}
