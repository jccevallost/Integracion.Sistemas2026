// domain/interfaces/services/ICountryService.ts
export interface ICountryService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
