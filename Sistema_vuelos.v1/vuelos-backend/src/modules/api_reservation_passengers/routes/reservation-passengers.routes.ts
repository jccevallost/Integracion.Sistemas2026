// presentation/routes/reservation-passengers.routes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { ReservationPassengerController } from '../controllers/ReservationPassengerController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { requirePassengerOwner, requireReservationOwner } from '../../../shared/middlewares/ownership.middleware.js';

export function createReservationPassengerRouter(controller: ReservationPassengerController, db: PrismaClient): Router {
  const router = Router();
  router.get('/',                                    authenticate, requireAdmin, controller.list);
  router.get('/by-reservation/:reservationId',       authenticate, requireReservationOwner(db, req => req.params.reservationId), controller.listByReservation);
  router.get('/:id',                                 authenticate, requirePassengerOwner(db, req => req.params.id), controller.getById);
  router.post('/',                                   authenticate, requireAdmin, controller.create);
  router.put('/:id',                                 authenticate, requireAdmin, controller.update);
  router.patch('/:id',                               authenticate, requireAdmin, controller.update);
  router.delete('/:id',                              authenticate, requireAdmin, controller.remove);
  return router;
}
