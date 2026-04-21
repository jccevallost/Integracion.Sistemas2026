// application/mappers/AirportMapper.ts
import { Airport } from '../entities/Airport.js';
import { AirportResponseDto } from '../dtos/AirportDto.js';

export class AirportMapper {
  static toEntity(raw: any): Airport {
    return new Airport(raw.id, raw.iataCode, raw.name, raw.cityId, raw.timezone);
  }

  static toDto(raw: any): AirportResponseDto {
    return {
      id: raw.id,
      iataCode: raw.iataCode,
      name: raw.name,
      timezone: raw.timezone,
      cityId: raw.cityId,
      city: raw.city
        ? {
            id: raw.city.id,
            name: raw.city.name,
            country: raw.city.country
              ? { id: raw.city.country.id, name: raw.city.country.name, isoCode: raw.city.country.isoCode }
              : undefined,
          }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): AirportResponseDto[] {
    return raws.map(this.toDto);
  }
}
