// domain/interfaces/services/ICityService.ts
export interface ICityService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
