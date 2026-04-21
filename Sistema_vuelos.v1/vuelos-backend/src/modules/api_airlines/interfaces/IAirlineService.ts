// domain/interfaces/services/IAirlineService.ts
export interface IAirlineService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
