// presentation/controllers/AuditLogController.ts
import { Request, Response, NextFunction } from 'express';
import { IAuditLogService } from '../interfaces/IAuditLogService.js';

export class AuditLogController {
  constructor(private readonly service: IAuditLogService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getById(String(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  listByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.findByUser(String(req.params.userId));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  listByEntity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { entity, entityId } = req.query as { entity: string; entityId?: string };
      const data = await this.service.findByEntity(entity, entityId);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  };
}
