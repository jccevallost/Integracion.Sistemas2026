// presentation/routes/reservation-passengers.routes.ts
import { Router } from 'express';
import { ReservationPassengerController } from '../controllers/ReservationPassengerController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createReservationPassengerRouter(controller: ReservationPassengerController): Router {
  const router = Router();
  router.get('/',                                    authenticate, requireAdmin, controller.list);
  router.get('/by-reservation/:reservationId',       authenticate, controller.listByReservation);
  router.get('/:id',                                 authenticate, controller.getById);
  router.post('/',                                   authenticate, requireAdmin, controller.create);
  router.put('/:id',                                 authenticate, requireAdmin, controller.update);
  router.patch('/:id',                               authenticate, requireAdmin, controller.update);
  router.delete('/:id',                              authenticate, requireAdmin, controller.remove);
  return router;
}
