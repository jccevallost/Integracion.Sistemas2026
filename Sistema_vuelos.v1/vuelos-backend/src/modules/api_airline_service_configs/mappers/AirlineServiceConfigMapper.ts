// application/mappers/AirlineServiceConfigMapper.ts
import { AirlineServiceConfig } from '../entities/AirlineServiceConfig.js';
import { AirlineServiceConfigResponseDto } from '../dtos/AirlineServiceConfigDto.js';

export class AirlineServiceConfigMapper {
  static toEntity(raw: any): AirlineServiceConfig {
    return new AirlineServiceConfig(
      raw.id,
      raw.serviceId,
      raw.airlineId,
      raw.originAirportId ?? null,
      raw.destAirportId ?? null,
      Number(raw.price),
      raw.currency ?? 'USD',
    );
  }

  static toDto(raw: any): AirlineServiceConfigResponseDto {
    return {
      id: raw.id,
      serviceId: raw.serviceId,
      airlineId: raw.airlineId,
      originAirportId: raw.originAirportId ?? null,
      destAirportId: raw.destAirportId ?? null,
      price: Number(raw.price),
      currency: raw.currency ?? 'USD',
      service: raw.service
        ? { id: raw.service.id, name: raw.service.name, code: raw.service.code, category: raw.service.category }
        : undefined,
      airline: raw.airline
        ? { id: raw.airline.id, name: raw.airline.name, iataCode: raw.airline.iataCode }
        : undefined,
      originAirport: raw.originAirport
        ? { id: raw.originAirport.id, name: raw.originAirport.name, iataCode: raw.originAirport.iataCode }
        : null,
      destAirport: raw.destAirport
        ? { id: raw.destAirport.id, name: raw.destAirport.name, iataCode: raw.destAirport.iataCode }
        : null,
    };
  }

  static toDtoList(raws: any[]): AirlineServiceConfigResponseDto[] {
    return raws.map(this.toDto);
  }
}
