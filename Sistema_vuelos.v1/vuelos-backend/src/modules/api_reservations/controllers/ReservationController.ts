// presentation/controllers/ReservationController.ts
import { Request, Response, NextFunction } from 'express';
import { IReservationService } from '../interfaces/IReservationService.js';

export class ReservationController {
  constructor(private readonly reservationService: IReservationService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const headerUserId =
        req.headers['x-user-id'] ??
        req.headers['x-booking-user-id'] ??
        req.headers['x-demo-user-id'];
      const userId =
        req.user?.id ??
        (req.body.userId as string | undefined) ??
        (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId) ??
        null;
      const data = await this.reservationService.create(userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (err: any) {
      if (err.message === 'NO_AVAILABILITY') {
        res.status(422).json({ success: false, error: { code: 'NO_AVAILABILITY', message: 'Sin disponibilidad al confirmar' } });
        return;
      }
      next(err);
    }
  };

  myReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.reservationService.getMyReservations(req.user!.id);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId  = req.user?.id ?? '';
      const isAdmin = req.user?.role === 'ADMIN';
      const data = await this.reservationService.getById(String(req.params.id), userId, isAdmin);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId  = req.user?.id ?? '';
      const isAdmin = req.user?.role === 'ADMIN';
      const data = await this.reservationService.cancel(String(req.params.id), userId, isAdmin);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  listAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.reservationService.listAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };
}
