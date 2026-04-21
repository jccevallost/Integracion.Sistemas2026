// application/dtos/AircraftDto.ts
export interface CreateAircraftDto {
  airlineId: string;
  modelName: string;
  registration: string;
  hasWifi?: boolean;
  hasUsb?: boolean;
}

export interface UpdateAircraftDto {
  airlineId?: string;
  modelName?: string;
  registration?: string;
  hasWifi?: boolean;
  hasUsb?: boolean;
}

export interface AircraftResponseDto {
  id: string;
  airlineId: string;
  modelName: string;
  registration: string;
  hasWifi: boolean;
  hasUsb: boolean;
  airline?: { id: string; name: string; iataCode: string };
}
