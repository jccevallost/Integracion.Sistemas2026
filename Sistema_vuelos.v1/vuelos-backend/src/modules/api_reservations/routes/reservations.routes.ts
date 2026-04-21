// presentation/routes/reservations.routes.ts
import { Router } from 'express';
import { ReservationController } from '../controllers/ReservationController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateReservationSchema } from '../../../shared/schemas/validation.schemas.js';

export function createReservationRouter(controller: ReservationController): Router {
  const router = Router();
  router.post('/',      authenticate, validate(CreateReservationSchema), controller.create);
  router.get('/my',     authenticate, controller.myReservations);
  router.get('/',       authenticate, requireAdmin, controller.listAll);
  router.get('/:id',    authenticate, controller.getById);
  router.delete('/:id', authenticate, controller.cancel);
  return router;
}
