// application/dtos/AirportDto.ts
export interface CreateAirportDto {
  iataCode: string;
  name: string;
  cityId: string;
  timezone: string;
}

export interface UpdateAirportDto {
  iataCode?: string;
  name?: string;
  cityId?: string;
  timezone?: string;
}

export interface AirportResponseDto {
  id: string;
  iataCode: string;
  name: string;
  timezone: string;
  cityId: string;
  city?: {
    id: string;
    name: string;
    country?: { id: string; name: string; isoCode: string };
  };
}
