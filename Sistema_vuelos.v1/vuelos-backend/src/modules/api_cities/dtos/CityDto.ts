// application/dtos/CityDto.ts
export interface CreateCityDto {
  name: string;
  countryId: string;
  iataCode?: string;
}

export interface UpdateCityDto {
  name?: string;
  countryId?: string;
  iataCode?: string;
}

export interface CityResponseDto {
  id: string;
  name: string;
  iataCode: string | null;
  countryId: string;
  country?: { id: string; name: string; isoCode: string };
}
