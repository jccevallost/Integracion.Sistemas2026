// domain/interfaces/services/IPaymentService.ts
export interface IPaymentService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByReservation(reservationId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
