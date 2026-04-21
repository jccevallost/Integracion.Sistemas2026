// application/mappers/SegmentMapper.ts
import { Segment } from '../entities/Segment.js';
import { SegmentResponseDto } from '../dtos/SegmentDto.js';

export class SegmentMapper {
  static toEntity(raw: any): Segment {
    return new Segment(
      raw.id,
      raw.segmentNumber,
      raw.originAirportId,
      raw.destinationAirportId,
      new Date(raw.departureDateTime),
      new Date(raw.arrivalDateTime),
      raw.airlineId,
      raw.aircraftId ?? null,
      raw.estimatedDuration,
      raw.flightId ?? null,
    );
  }

  static toDto(raw: any): SegmentResponseDto {
    return {
      id: raw.id,
      segmentNumber: raw.segmentNumber,
      originAirportId: raw.originAirportId,
      destinationAirportId: raw.destinationAirportId,
      departureDateTime: raw.departureDateTime?.toISOString?.() ?? raw.departureDateTime,
      arrivalDateTime: raw.arrivalDateTime?.toISOString?.() ?? raw.arrivalDateTime,
      airlineId: raw.airlineId,
      aircraftId: raw.aircraftId ?? null,
      estimatedDuration: raw.estimatedDuration,
      flightId: raw.flightId ?? null,
      originAirport: raw.originAirport
        ? { id: raw.originAirport.id, name: raw.originAirport.name, iataCode: raw.originAirport.iataCode }
        : undefined,
      destinationAirport: raw.destinationAirport
        ? { id: raw.destinationAirport.id, name: raw.destinationAirport.name, iataCode: raw.destinationAirport.iataCode }
        : undefined,
      airline: raw.airline
        ? { id: raw.airline.id, name: raw.airline.name, iataCode: raw.airline.iataCode }
        : undefined,
      aircraft: raw.aircraft
        ? { id: raw.aircraft.id, modelName: raw.aircraft.modelName, registration: raw.aircraft.registration }
        : null,
    };
  }

  static toDtoList(raws: any[]): SegmentResponseDto[] {
    return raws.map(this.toDto);
  }
}
