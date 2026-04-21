// application/dtos/SegmentDto.ts
export interface CreateSegmentDto {
  segmentNumber: string;
  originAirportId: string;
  destinationAirportId: string;
  departureDateTime: string;
  arrivalDateTime: string;
  airlineId: string;
  aircraftId?: string | null;
  estimatedDuration: number;
  flightId?: string | null;
}

export interface UpdateSegmentDto {
  segmentNumber?: string;
  originAirportId?: string;
  destinationAirportId?: string;
  departureDateTime?: string;
  arrivalDateTime?: string;
  airlineId?: string;
  aircraftId?: string | null;
  estimatedDuration?: number;
  flightId?: string | null;
}

export interface SegmentResponseDto {
  id: string;
  segmentNumber: string;
  originAirportId: string;
  destinationAirportId: string;
  departureDateTime: string;
  arrivalDateTime: string;
  airlineId: string;
  aircraftId: string | null;
  estimatedDuration: number;
  flightId: string | null;
  originAirport?: { id: string; name: string; iataCode: string };
  destinationAirport?: { id: string; name: string; iataCode: string };
  airline?: { id: string; name: string; iataCode: string };
  aircraft?: { id: string; modelName: string; registration: string } | null;
}
