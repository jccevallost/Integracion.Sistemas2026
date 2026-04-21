// domain/interfaces/services/IFlightClassService.ts
export interface IFlightClassService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByFlight(flightId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
