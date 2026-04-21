// application/dtos/PassengerServiceDto.ts
export interface CreatePassengerServiceDto {
  passengerId: string;
  serviceConfigId: string;
  quantity: number;
  unitPriceAtBooking: number;
}

export interface UpdatePassengerServiceDto {
  quantity?: number;
  unitPriceAtBooking?: number;
}

export interface PassengerServiceResponseDto {
  id: string;
  passengerId: string;
  serviceConfigId: string;
  quantity: number;
  unitPriceAtBooking: number;
  totalPrice: number;
  passenger?: { id: string; firstName: string; lastName: string };
  serviceConfig?: { id: string; price: number; currency: string; service?: { name: string; code: string } };
}
