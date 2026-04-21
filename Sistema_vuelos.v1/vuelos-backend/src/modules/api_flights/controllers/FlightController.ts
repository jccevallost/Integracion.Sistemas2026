// presentation/controllers/FlightController.ts
import { Request, Response, NextFunction } from 'express';
import { IFlightService } from '../interfaces/IFlightService.js';

export class FlightController {
  constructor(private readonly flightService: IFlightService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.flightService.listAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { origin, destination, date, passengers, cabinClass } = req.query;
      const data = await this.flightService.search(
        origin as string, destination as string, date as string,
        passengers ? Number(passengers) : undefined,
        cabinClass as string | undefined,
      );
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.flightService.getById(String(req.params.id));
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.flightService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.flightService.update(String(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.flightService.remove(String(req.params.id));
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  };
}
