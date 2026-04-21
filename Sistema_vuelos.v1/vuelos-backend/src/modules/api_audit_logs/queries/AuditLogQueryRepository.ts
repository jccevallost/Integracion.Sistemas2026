// infrastructure/queries/AuditLogQueryRepository.ts
import { PrismaClient } from '@prisma/client';

export class AuditLogQueryRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStats() {
    const [total, byEntity] = await Promise.all([
      this.db.auditLog.count(),
      this.db.auditLog.groupBy({ by: ['entity'], _count: { id: true } }),
    ]);
    return { total, byEntity };
  }

  async findByUser(userId: string) {
    return this.db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findByEntity(entity: string, entityId?: string) {
    return this.db.auditLog.findMany({
      where: { entity, ...(entityId ? { entityId } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findAll(limit = 200) {
    return this.db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
