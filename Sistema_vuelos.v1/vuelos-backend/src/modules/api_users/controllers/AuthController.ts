// presentation/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../interfaces/IAuthService.js';

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.getProfile(req.user!.id);
      res.status(200).json({ success: true, data: user });
    } catch (err) { next(err); }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authService.updateProfile(req.user!.id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (err) { next(err); }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.changePassword(req.user!.id, req.body);
      res.status(200).json({ success: true, data: { message: 'Contraseña actualizada correctamente' } });
    } catch (err) { next(err); }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.logout(req.user!.id);
      res.status(200).json({ success: true, data: { message: 'Sesión cerrada correctamente' } });
    } catch (err) { next(err); }
  };
}
