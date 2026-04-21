// application/dtos/FlightDto.ts
export interface CreateFlightDto {
  originAirportIata: string;
  destinationAirportIata: string;
  departureDate: string;
  status?: string;
  segments?: CreateSegmentDto[];
  flightClasses?: CreateFlightClassDto[];
}

export interface CreateSegmentDto {
  segmentNumber: string;
  originAirportId: string;
  destinationAirportId: string;
  departureDateTime: string;
  arrivalDateTime: string;
  airlineId: string;
  aircraftId?: string;
  estimatedDuration: number;
}

export interface CreateFlightClassDto {
  cabinClass: string;
  availableSeats: number;
  basePrice: number;
}

export interface UpdateFlightDto {
  status?: string;
  departureDate?: string;
  originAirportIata?: string;
  destinationAirportIata?: string;
}

export interface FlightResponseDto {
  id: string;
  originAirportIata: string;
  destinationAirportIata: string;
  departureDate: string;
  status: string;
  duration?: number;
  stops?: number;
  lowestPrice?: number;
  // Campos de conveniencia (calculados desde segments)
  flightNumber?: string;
  departureDateTime?: string | null;
  arrivalDateTime?: string | null;
  airline?: any;
  aircraft?: string | null;
  route?: {
    estimatedDuration: number;
    originAirport: {
      id: string | null;
      iataCode: string;
      name: string;
      city: string;
      country: string;
      timezone: string;
    };
    destinationAirport: {
      id: string | null;
      iataCode: string;
      name: string;
      city: string;
      country: string;
      timezone: string;
    };
  };
  segments?: any[];
  flightClasses?: any[];
}
