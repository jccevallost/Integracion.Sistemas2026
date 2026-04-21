// domain/interfaces/services/IUserService.ts
export interface IUserService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
