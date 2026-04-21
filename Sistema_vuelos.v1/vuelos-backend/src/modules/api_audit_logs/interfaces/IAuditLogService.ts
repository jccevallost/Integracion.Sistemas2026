// domain/interfaces/services/IAuditLogService.ts
export interface IAuditLogService {
  listAll(): Promise<any[]>;
  getById(id: string): Promise<any>;
  findByUser(userId: string): Promise<any[]>;
  findByEntity(entity: string, entityId?: string): Promise<any[]>;
  create(data: any): Promise<any>;
}
