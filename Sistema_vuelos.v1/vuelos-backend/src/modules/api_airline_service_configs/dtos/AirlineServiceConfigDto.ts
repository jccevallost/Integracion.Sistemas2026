// application/dtos/AirlineServiceConfigDto.ts
export interface CreateAirlineServiceConfigDto {
  serviceId: string;
  airlineId: string;
  originAirportId?: string | null;
  destAirportId?: string | null;
  price: number;
  currency?: string;
}

export interface UpdateAirlineServiceConfigDto {
  serviceId?: string;
  airlineId?: string;
  originAirportId?: string | null;
  destAirportId?: string | null;
  price?: number;
  currency?: string;
}

export interface AirlineServiceConfigResponseDto {
  id: string;
  serviceId: string;
  airlineId: string;
  originAirportId: string | null;
  destAirportId: string | null;
  price: number;
  currency: string;
  service?: { id: string; name: string; code: string; category: string };
  airline?: { id: string; name: string; iataCode: string };
  originAirport?: { id: string; name: string; iataCode: string } | null;
  destAirport?: { id: string; name: string; iataCode: string } | null;
}
