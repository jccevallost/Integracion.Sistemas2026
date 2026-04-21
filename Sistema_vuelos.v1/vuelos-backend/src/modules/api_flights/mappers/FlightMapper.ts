// application/mappers/FlightMapper.ts
import { FlightResponseDto } from '../dtos/FlightDto.js';

export class FlightMapper {
  static toDto(raw: any): FlightResponseDto {
    const segments: any[] = raw.segments ?? [];
    const duration = FlightMapper.calculateDuration(segments);
    const firstSeg = segments[0] ?? null;
    const lastSeg  = segments[segments.length - 1] ?? null;

    const flightClasses = (raw.flightClasses ?? []).map((fc: any) => ({
      ...fc,
      classType: fc.cabinClass,          // alias para el frontend
      basePrice: Number(fc.basePrice),
    }));

    return {
      id: raw.id,
      originAirportIata: raw.originAirportIata,
      destinationAirportIata: raw.destinationAirportIata,
      departureDate: raw.departureDate?.toISOString?.() ?? raw.departureDate,
      status: raw.status,
      duration,
      stops: Math.max(0, segments.length - 1),
      lowestPrice: flightClasses.length
        ? Math.min(...flightClasses.map((fc: any) => Number(fc.basePrice)))
        : undefined,
      // ── Campos de conveniencia para el frontend ──────────────
      flightNumber: firstSeg?.segmentNumber ?? `${raw.originAirportIata}-${raw.destinationAirportIata}`,
      departureDateTime: firstSeg?.departureDateTime?.toISOString?.() ?? firstSeg?.departureDateTime ?? null,
      arrivalDateTime:   lastSeg?.arrivalDateTime?.toISOString?.()  ?? lastSeg?.arrivalDateTime  ?? null,
      airline: firstSeg?.airline ?? null,
      aircraft: firstSeg?.aircraft?.modelName ?? null,
      route: {
        estimatedDuration: duration,
        originAirport: {
          id:       firstSeg?.originAirport?.id ?? null,
          iataCode: raw.originAirportIata,
          name:     firstSeg?.originAirport?.name ?? '',
          city:     firstSeg?.originAirport?.city?.name ?? '',
          country:  firstSeg?.originAirport?.city?.country?.name ?? '',
          timezone: firstSeg?.originAirport?.timezone ?? '',
        },
        destinationAirport: {
          id:       lastSeg?.destinationAirport?.id ?? null,
          iataCode: raw.destinationAirportIata,
          name:     lastSeg?.destinationAirport?.name ?? '',
          city:     lastSeg?.destinationAirport?.city?.name ?? '',
          country:  lastSeg?.destinationAirport?.city?.country?.name ?? '',
          timezone: lastSeg?.destinationAirport?.timezone ?? '',
        },
      },
      segments,
      flightClasses,
    };
  }

  static toDtoList(raws: any[]): FlightResponseDto[] {
    return raws.map(FlightMapper.toDto);
  }

  static calculateDuration(segments: any[]): number {
    if (!segments.length) return 0;
    const first = new Date(segments[0].departureDateTime);
    const last  = new Date(segments[segments.length - 1].arrivalDateTime);
    return Math.floor((last.getTime() - first.getTime()) / 60000);
  }
}
