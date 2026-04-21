// application/mappers/CityMapper.ts
import { City } from '../entities/City.js';
import { CityResponseDto } from '../dtos/CityDto.js';

export class CityMapper {
  static toEntity(raw: any): City {
    return new City(raw.id, raw.name, raw.countryId, raw.iataCode ?? null);
  }

  static toDto(raw: any): CityResponseDto {
    return {
      id: raw.id,
      name: raw.name,
      iataCode: raw.iataCode ?? null,
      countryId: raw.countryId,
      country: raw.country
        ? { id: raw.country.id, name: raw.country.name, isoCode: raw.country.isoCode }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): CityResponseDto[] {
    return raws.map(this.toDto);
  }
}
