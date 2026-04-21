// infrastructure/repositories/AuditLogRepository.ts
import { PrismaClient } from '@prisma/client';
import { IAuditLogRepository } from '../interfaces/IAuditLogRepository.js';
import { AuditLog } from '../entities/AuditLog.js';
import { PagedResult } from '../../../shared/interfaces/IBaseRepository.js';

export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly db: PrismaClient) {}

  async findAll(page = 1, limit = 100): Promise<PagedResult<AuditLog>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.db.auditLog.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.db.auditLog.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.db.auditLog.findUnique({ where: { id } }) as any;
  }

  async log(entry: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
    await this.db.auditLog.create({ data: entry as any });
  }

  async create(data: any): Promise<AuditLog> {
    return this.db.auditLog.create({ data }) as any;
  }

  async update(id: string, data: any): Promise<AuditLog> {
    return this.db.auditLog.update({ where: { id }, data }) as any;
  }

  async delete(id: string): Promise<void> {
    await this.db.auditLog.delete({ where: { id } });
  }
}
