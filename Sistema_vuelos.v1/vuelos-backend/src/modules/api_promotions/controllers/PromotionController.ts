// presentation/controllers/PromotionController.ts
import { Request, Response, NextFunction } from 'express';
import { IPromotionService } from '../interfaces/IPromotionService.js';

export class PromotionController {
  constructor(private readonly promotionService: IPromotionService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.promotionService.listAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  validate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, amount } = req.body;
      const data = await this.promotionService.validate(code, Number(amount));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.promotionService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.promotionService.update(String(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.promotionService.remove(String(req.params.id));
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  };
}
