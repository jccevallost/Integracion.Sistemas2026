// application/mappers/AircraftMapper.ts
import { Aircraft } from '../entities/Aircraft.js';
import { AircraftResponseDto } from '../dtos/AircraftDto.js';

export class AircraftMapper {
  static toEntity(raw: any): Aircraft {
    return new Aircraft(
      raw.id,
      raw.airlineId,
      raw.modelName,
      raw.registration,
      raw.hasWifi ?? false,
      raw.hasUsb ?? false,
    );
  }

  static toDto(raw: any): AircraftResponseDto {
    return {
      id: raw.id,
      airlineId: raw.airlineId,
      modelName: raw.modelName,
      registration: raw.registration,
      hasWifi: raw.hasWifi ?? false,
      hasUsb: raw.hasUsb ?? false,
      airline: raw.airline
        ? { id: raw.airline.id, name: raw.airline.name, iataCode: raw.airline.iataCode }
        : undefined,
    };
  }

  static toDtoList(raws: any[]): AircraftResponseDto[] {
    return raws.map(this.toDto);
  }
}
