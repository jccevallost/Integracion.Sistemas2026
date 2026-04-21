// application/services/AuditLogService.ts
import { IAuditLogService } from '../interfaces/IAuditLogService.js';
import { IAuditLogRepository } from '../interfaces/IAuditLogRepository.js';
import { NotFoundException } from '../../../shared/exceptions/BusinessException.js';

export class AuditLogService implements IAuditLogService {
  constructor(private readonly repo: IAuditLogRepository) {}

  async listAll() { return (await this.repo.findAll()).data; }

  async getById(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Registro de auditoría', id);
    return item;
  }

  async findByUser(userId: string) {
    const result = await this.repo.findAll();
    return result.data.filter((l: any) => l.userId === userId);
  }

  async findByEntity(entity: string, entityId?: string) {
    const result = await this.repo.findAll();
    return result.data.filter(
      (l: any) => l.entity === entity && (!entityId || l.entityId === entityId),
    );
  }

  async create(data: any) { return this.repo.create(data); }
}
