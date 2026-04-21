// application/dtos/FlightClassDto.ts
export interface CreateFlightClassDto {
  flightId: string;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  availableSeats: number;
  basePrice: number;
}

export interface UpdateFlightClassDto {
  cabinClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  availableSeats?: number;
  basePrice?: number;
}

export interface FlightClassResponseDto {
  id: string;
  flightId: string;
  cabinClass: string;
  availableSeats: number;
  basePrice: number;
  flight?: { id: string; originAirportIata: string; destinationAirportIata: string; departureDate: string };
}
