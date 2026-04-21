// domain/interfaces/services/IReservationPassengerService.ts
export interface IReservationPassengerService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByReservation(reservationId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
