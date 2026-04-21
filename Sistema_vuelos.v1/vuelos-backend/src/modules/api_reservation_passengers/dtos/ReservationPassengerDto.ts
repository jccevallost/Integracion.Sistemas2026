// application/dtos/ReservationPassengerDto.ts
export interface CreateReservationPassengerDto {
  reservationId: string;
  flightClassId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  seatNumber?: string | null;
}

export interface UpdateReservationPassengerDto {
  firstName?: string;
  lastName?: string;
  documentNumber?: string;
  seatNumber?: string | null;
}

export interface ReservationPassengerResponseDto {
  id: string;
  reservationId: string;
  flightClassId: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  seatNumber: string | null;
  reservation?: { id: string; reservationCode: string };
  flightClass?: { id: string; cabinClass: string; basePrice: number };
  services?: any[];
  boardingPasses?: any[];
}
