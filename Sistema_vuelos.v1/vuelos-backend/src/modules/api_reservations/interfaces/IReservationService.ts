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
  idCarrito?: string;
  metodoPagoId?: string;
  currency?: string;
}

export interface IReservationService {
  create(userId: string | null | undefined, dto: CreateReservationDto): Promise<any>;
  getMyReservations(userId: string): Promise<any[]>;
  getById(id: string, requestingUserId: string, isAdmin: boolean): Promise<any>;
  cancel(id: string, requestingUserId: string, isAdmin: boolean): Promise<any>;
  listAll(): Promise<any[]>;
}
