// domain/interfaces/services/IAirportService.ts
export interface IAirportService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  search(query: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
