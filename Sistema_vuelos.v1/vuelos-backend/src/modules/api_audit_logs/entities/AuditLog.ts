// domain/entities/AuditLog.ts
export class AuditLog {
  constructor(
    public readonly id: string,
    public userId: string | null,
    public action: string,
    public entity: string,
    public entityId: string,
    public oldData: Record<string, unknown> | null,
    public newData: Record<string, unknown> | null,
    public ipAddress: string | null,
    public userAgent: string | null,
    public readonly createdAt: Date,
  ) {}
}
