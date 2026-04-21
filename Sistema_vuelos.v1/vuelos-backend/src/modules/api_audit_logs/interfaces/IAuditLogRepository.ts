// domain/interfaces/repositories/IAuditLogRepository.ts
import { AuditLog } from '../entities/AuditLog.js';
import { IBaseRepository } from '../../../shared/interfaces/IBaseRepository.js';

export interface IAuditLogRepository extends IBaseRepository<AuditLog> {
  log(entry: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void>;
}
