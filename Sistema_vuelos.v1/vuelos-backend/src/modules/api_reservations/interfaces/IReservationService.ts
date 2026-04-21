// domain/interfaces/services/IReservationService.ts
export interface CreateReservationDto {
  flightClassId: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    documentNumber: string;
    seatNumber?: string;
  }>;
  promotionCode?: string;
}

export interface IReservationService {
  create(userId: string, dto: CreateReservationDto): Promise<any>;
  getMyReservations(userId: string): Promise<any[]>;
  getById(id: string, requestingUserId: string, isAdmin: boolean): Promise<any>;
  cancel(id: string, requestingUserId: string, isAdmin: boolean): Promise<any>;
  listAll(): Promise<any[]>;
}
