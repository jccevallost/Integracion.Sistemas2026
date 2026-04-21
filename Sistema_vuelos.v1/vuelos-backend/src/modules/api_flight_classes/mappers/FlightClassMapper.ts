// application/mappers/FlightClassMapper.ts
import { FlightClass } from '../entities/FlightClass.js';
import { FlightClassResponseDto } from '../dtos/FlightClassDto.js';

export class FlightClassMapper {
  static toEntity(raw: any): FlightClass {
    return new FlightClass(
      raw.id,
      raw.flightId,
      raw.cabinClass,
      raw.availableSeats,
      Number(raw.basePrice),
    );
  }

  static toDto(raw: any): FlightClassResponseDto {
    return {
      id: raw.id,
      flightId: raw.flightId,
      cabinClass: raw.cabinClass,
      availableSeats: raw.availableSeats,
      basePrice: Number(raw.basePrice),
      flight: raw.flight
        ? {
            id: raw.flight.id,
            originAirportIata: raw.flight.originAirportIata,
            destinationAirportIata: raw.flight.destinationAirportIata,
            departureDate: raw.flight.departureDate?.toISOString?.() ?? raw.flight.departureDate,
          }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): FlightClassResponseDto[] {
    return raws.map(this.toDto);
  }
}
