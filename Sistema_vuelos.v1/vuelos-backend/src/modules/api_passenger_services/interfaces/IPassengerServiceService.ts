// domain/interfaces/services/IPassengerServiceService.ts
export interface IPassengerServiceService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByPassenger(passengerId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
