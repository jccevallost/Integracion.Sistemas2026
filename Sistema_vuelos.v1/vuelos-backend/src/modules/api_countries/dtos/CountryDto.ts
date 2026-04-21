// application/dtos/CountryDto.ts
export interface CreateCountryDto {
  name: string;
  isoCode: string;
  phoneCode?: string;
  currencyCode?: string;
}

export interface UpdateCountryDto {
  name?: string;
  isoCode?: string;
  phoneCode?: string;
  currencyCode?: string;
}

export interface CountryResponseDto {
  id: string;
  name: string;
  isoCode: string;
  phoneCode: string | null;
  currencyCode: string | null;
}
