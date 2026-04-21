// application/mappers/ServiceCatalogMapper.ts
import { ServiceCatalog } from '../entities/ServiceCatalog.js';
import { ServiceCatalogResponseDto } from '../dtos/ServiceCatalogDto.js';

export class ServiceCatalogMapper {
  static toEntity(raw: any): ServiceCatalog {
    return new ServiceCatalog(
      raw.id,
      raw.name,
      raw.code,
      raw.category,
      raw.description ?? null,
    );
  }

  static toDto(raw: any): ServiceCatalogResponseDto {
    return {
      id: raw.id,
      name: raw.name,
      code: raw.code,
      category: raw.category,
      description: raw.description ?? null,
    };
  }

  static toDtoList(raws: any[]): ServiceCatalogResponseDto[] {
    return raws.map(this.toDto);
  }
}
