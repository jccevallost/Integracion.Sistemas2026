// domain/interfaces/services/IFlightService.ts
export interface IFlightService {
  listAll(): Promise<any[]>;
  search(origin: string, destination: string, date: string, passengers?: number, cabinClass?: string): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
