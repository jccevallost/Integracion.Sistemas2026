// domain/interfaces/services/IBillingProfileService.ts
export interface IBillingProfileService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByUser(userId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  remove(id: string): Promise<void>;
}
