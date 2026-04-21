// application/dtos/ReservationDto.ts
export interface PassengerDto {
  firstName: string;
  lastName: string;
  documentNumber: string;
  seatNumber?: string;
}

export interface CreateReservationDto {
  flightClassId: string;
  passengers: PassengerDto[];
  promotionCode?: string;
}

export interface ReservationResponseDto {
  id: string;
  reservationCode: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  flight?: any;
  passengers?: any[];
  promotion?: any;
  user?: any;
}
