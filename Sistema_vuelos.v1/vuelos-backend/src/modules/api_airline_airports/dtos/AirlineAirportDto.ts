// application/dtos/AirlineAirportDto.ts
export interface CreateAirlineAirportDto {
  airlineId: string;
  airportId: string;
}

export interface AirlineAirportResponseDto {
  airlineId: string;
  airportId: string;
  airline?: { id: string; name: string; iataCode: string };
  airport?: { id: string; name: string; iataCode: string };
}
