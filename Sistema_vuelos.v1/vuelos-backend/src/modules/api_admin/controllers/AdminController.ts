// presentation/controllers/AdminController.ts
// Controlador genérico para entidades CRUD simples del panel admin
import { Request, Response, NextFunction } from 'express';
import { IUserService } from '../../api_users/interfaces/IUserService.js';
import {
  AirportQueryRepository,
  FlightQueryRepository as FlightQR,
  ReservationQueryRepository,
  UserQueryRepository,
} from '../../../shared/queries/index.js';

export class AdminController {
  constructor(
    private readonly userService: IUserService,
    private readonly airportQuery: AirportQueryRepository,
    private readonly flightQuery: FlightQR,
    private readonly reservationQuery: ReservationQueryRepository,
    private readonly userQuery: UserQueryRepository,
  ) {}

  // ── Dashboard stats ────────────────────────────────────────
  dashboard = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [flights, reservations, users, airports] = await Promise.all([
        this.flightQuery.getFlightStats(),
        this.reservationQuery.getDashboardStats(),
        this.userQuery.getDashboardStats(),
        this.airportQuery.getDashboardStats(),
      ]);
      res.json({ success: true, data: { flights, reservations, users, airports } });
    } catch (err) { next(err); }
  };

  // ── Users ──────────────────────────────────────────────────
  listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.userService.listAll();
      res.json({ success: true, data: { data, pagination: { total: data.length } } });
    } catch (err) { next(err); }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.userService.update(String(req.params.id), req.body);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.userService.remove(String(req.params.id));
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  };
}
