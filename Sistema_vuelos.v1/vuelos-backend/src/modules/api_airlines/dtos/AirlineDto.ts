// application/dtos/AirlineDto.ts
export interface CreateAirlineDto {
  iataCode: string;
  name: string;
  countryId: string;
  logoUrl?: string;
}

export interface UpdateAirlineDto {
  iataCode?: string;
  name?: string;
  countryId?: string;
  logoUrl?: string;
}

export interface AirlineResponseDto {
  id: string;
  iataCode: string;
  name: string;
  logoUrl: string | null;
  countryId: string;
  country?: { id: string; name: string; isoCode: string };
}
