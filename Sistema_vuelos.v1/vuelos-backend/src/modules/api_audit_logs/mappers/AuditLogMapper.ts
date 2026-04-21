// application/mappers/AuditLogMapper.ts
import { AuditLog } from '../entities/AuditLog.js';
import { AuditLogResponseDto } from '../dtos/AuditLogDto.js';

export class AuditLogMapper {
  static toEntity(raw: any): AuditLog {
    return new AuditLog(
      raw.id,
      raw.userId ?? null,
      raw.action,
      raw.entity,
      raw.entityId,
      raw.oldData ?? null,
      raw.newData ?? null,
      raw.ipAddress ?? null,
      raw.userAgent ?? null,
      raw.createdAt,
    );
  }

  static toDto(raw: any): AuditLogResponseDto {
    return {
      id: raw.id,
      userId: raw.userId ?? null,
      action: raw.action,
      entity: raw.entity,
      entityId: raw.entityId,
      oldData: raw.oldData ?? null,
      newData: raw.newData ?? null,
      ipAddress: raw.ipAddress ?? null,
      userAgent: raw.userAgent ?? null,
      createdAt: raw.createdAt?.toISOString?.() ?? raw.createdAt,
    };
  }

  static toDtoList(raws: any[]): AuditLogResponseDto[] {
    return raws.map(this.toDto);
  }
}
