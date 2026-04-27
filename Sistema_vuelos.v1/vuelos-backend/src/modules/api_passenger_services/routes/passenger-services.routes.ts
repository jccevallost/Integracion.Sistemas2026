// presentation/routes/passenger-services.routes.ts
import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { PrismaClient } from '@prisma/client';
import { PassengerServiceController } from '../controllers/PassengerServiceController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreatePassengerServiceSchema, UpdatePassengerServiceSchema } from '../../../shared/schemas/validation.schemas.js';

async function ensurePassengerOwner(db: PrismaClient, req: Request, res: Response, next: NextFunction) {
  try {
    const passengerId = String((req.params as any).passengerId ?? (req.body as any).passengerId ?? '');
    const isAdmin = req.user?.role === 'ADMIN';
    const passenger = await db.reservationPassenger.findUnique({
      where: { id: passengerId },
      include: { reservation: { select: { userId: true } } },
    });

    if (!passenger) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Pasajero no encontrado' } });
      return;
    }
    if (!isAdmin && passenger.reservation.userId !== req.user?.id) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Sin permisos para este pasajero' } });
      return;
    }

    next();
  } catch (err) { next(err); }
}

async function ensurePassengerServiceOwner(db: PrismaClient, req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const isAdmin = req.user?.role === 'ADMIN';
    const passengerService = await db.passengerService.findUnique({
      where: { id },
      include: { passenger: { include: { reservation: { select: { userId: true } } } } },
    });

    if (!passengerService) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Servicio no encontrado' } });
      return;
    }
    if (!isAdmin && passengerService.passenger.reservation.userId !== req.user?.id) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Sin permisos para este servicio' } });
      return;
    }

    next();
  } catch (err) { next(err); }
}

async function lockServicePrice(db: PrismaClient, req: Request, res: Response, next: NextFunction) {
  try {
    const serviceConfigId = String((req.body as any).serviceConfigId ?? '');
    const config = await db.airlineServiceConfig.findUnique({ where: { id: serviceConfigId } });
    if (!config) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Configuracion de servicio no encontrada' } });
      return;
    }
    (req.body as any).unitPriceAtBooking = Number(config.price);
    next();
  } catch (err) { next(err); }
}

export function createPassengerServiceRouter(controller: PassengerServiceController, db: PrismaClient): Router {
  const router = Router();
  router.get('/',                              authenticate, requireAdmin, controller.list);
  router.get('/by-passenger/:passengerId',     authenticate, (req, res, next) => ensurePassengerOwner(db, req, res, next), controller.listByPassenger);
  router.get('/:id',                           authenticate, (req, res, next) => ensurePassengerServiceOwner(db, req, res, next), controller.getById);
  router.post('/',                             authenticate, validate(CreatePassengerServiceSchema), (req, res, next) => ensurePassengerOwner(db, req, res, next), (req, res, next) => lockServicePrice(db, req, res, next), controller.create);
  router.put('/:id',                           authenticate, requireAdmin, validate(UpdatePassengerServiceSchema), controller.update);
  router.patch('/:id',                         authenticate, requireAdmin, validate(UpdatePassengerServiceSchema), controller.update);
  router.delete('/:id',                        authenticate, (req, res, next) => ensurePassengerServiceOwner(db, req, res, next), controller.remove);
  return router;
}
