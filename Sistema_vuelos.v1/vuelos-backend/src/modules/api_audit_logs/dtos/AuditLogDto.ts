// application/dtos/AuditLogDto.ts
export interface CreateAuditLogDto {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuditLogResponseDto {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
