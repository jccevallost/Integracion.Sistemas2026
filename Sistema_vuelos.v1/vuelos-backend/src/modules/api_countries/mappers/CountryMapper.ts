// application/mappers/CountryMapper.ts
import { Country } from '../entities/Country.js';
import { CountryResponseDto } from '../dtos/CountryDto.js';

export class CountryMapper {
  static toEntity(raw: any): Country {
    return new Country(raw.id, raw.name, raw.isoCode, raw.phoneCode, raw.currencyCode);
  }

  static toDto(entity: Country): CountryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      isoCode: entity.isoCode,
      phoneCode: entity.phoneCode,
      currencyCode: entity.currencyCode,
    };
  }

  static toDtoList(entities: Country[]): CountryResponseDto[] {
    return entities.map(this.toDto);
  }
}
