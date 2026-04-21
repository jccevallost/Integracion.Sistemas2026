// application/mappers/AirlineMapper.ts
import { Airline } from '../entities/Airline.js';
import { AirlineResponseDto } from '../dtos/AirlineDto.js';

export class AirlineMapper {
  static toEntity(raw: any): Airline {
    return new Airline(
      raw.id,
      raw.iataCode,
      raw.name,
      raw.logoUrl ?? null,
      raw.countryId,
    );
  }

  static toDto(raw: any): AirlineResponseDto {
    return {
      id: raw.id,
      iataCode: raw.iataCode,
      name: raw.name,
      logoUrl: raw.logoUrl ?? null,
      countryId: raw.countryId,
      country: raw.country
        ? { id: raw.country.id, name: raw.country.name, isoCode: raw.country.isoCode }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): AirlineResponseDto[] {
    return raws.map(this.toDto);
  }
}
