// presentation/controllers/AirportController.ts
import { Request, Response, NextFunction } from 'express';
import { IAirportService } from '../interfaces/IAirportService.js';

export class AirportController {
  constructor(private readonly service: IAirportService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string) ?? '';
      const data = await this.service.search(q);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getById(String(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.update(String(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.remove(String(req.params.id));
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  };
}
