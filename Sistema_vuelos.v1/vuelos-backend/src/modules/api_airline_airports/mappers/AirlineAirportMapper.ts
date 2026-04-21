// application/mappers/AirlineAirportMapper.ts
import { AirlineAirport } from '../entities/AirlineAirport.js';
import { AirlineAirportResponseDto } from '../dtos/AirlineAirportDto.js';

export class AirlineAirportMapper {
  static toEntity(raw: any): AirlineAirport {
    return new AirlineAirport(raw.airlineId, raw.airportId);
  }

  static toDto(raw: any): AirlineAirportResponseDto {
    return {
      airlineId: raw.airlineId,
      airportId: raw.airportId,
      airline: raw.airline
        ? { id: raw.airline.id, name: raw.airline.name, iataCode: raw.airline.iataCode }
        : undefined,
      airport: raw.airport
        ? { id: raw.airport.id, name: raw.airport.name, iataCode: raw.airport.iataCode }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): AirlineAirportResponseDto[] {
    return raws.map(this.toDto);
  }
}
