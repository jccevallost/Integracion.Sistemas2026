// presentation/routes/payments.routes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { PaymentController } from '../controllers/PaymentController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { prepareCustomerPayment, requirePaymentOwner, requireReservationOwner } from '../../../shared/middlewares/ownership.middleware.js';
import { CreatePaymentSchema, UpdatePaymentSchema } from '../../../shared/schemas/validation.schemas.js';

export function createPaymentRouter(controller: PaymentController, db: PrismaClient): Router {
  const router = Router();
  router.get('/',                                authenticate, requireAdmin, controller.list);
  router.get('/by-reservation/:reservationId',   authenticate, requireReservationOwner(db, req => req.params.reservationId), controller.listByReservation);
  router.get('/:id',                             authenticate, requirePaymentOwner(db, req => req.params.id), controller.getById);
  router.post('/',                               authenticate, validate(CreatePaymentSchema), prepareCustomerPayment(db), controller.create);
  router.put('/:id',                             authenticate, requireAdmin, validate(UpdatePaymentSchema), controller.update);
  router.patch('/:id',                           authenticate, requireAdmin, validate(UpdatePaymentSchema), controller.update);
  router.delete('/:id',                          authenticate, requireAdmin, controller.remove);
  return router;
}
