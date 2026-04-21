// presentation/routes/payments.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreatePaymentSchema, UpdatePaymentSchema } from '../../../shared/schemas/validation.schemas.js';

export function createPaymentRouter(controller: PaymentController): Router {
  const router = Router();
  router.get('/',                                authenticate, requireAdmin, controller.list);
  router.get('/by-reservation/:reservationId',   authenticate, controller.listByReservation);
  router.get('/:id',                             authenticate, controller.getById);
  router.post('/',                               authenticate, validate(CreatePaymentSchema), controller.create);
  router.put('/:id',                             authenticate, requireAdmin, validate(UpdatePaymentSchema), controller.update);
  router.patch('/:id',                           authenticate, requireAdmin, validate(UpdatePaymentSchema), controller.update);
  router.delete('/:id',                          authenticate, requireAdmin, controller.remove);
  return router;
}
