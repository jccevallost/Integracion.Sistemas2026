// presentation/controllers/AirlineAirportController.ts
import { Request, Response, NextFunction } from 'express';
import { IAirlineAirportService } from '../interfaces/IAirlineAirportService.js';

export class AirlineAirportController {
  constructor(private readonly service: IAirlineAirportService) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.listAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  listByAirline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.findByAirline(String(req.params.airlineId));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  listByAirport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.findByAirport(String(req.params.airportId));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { airlineId, airportId } = req.body;
      const data = await this.service.create({ airlineId, airportId });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.remove(String(req.params.airlineId), String(req.params.airportId));
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  };
}
