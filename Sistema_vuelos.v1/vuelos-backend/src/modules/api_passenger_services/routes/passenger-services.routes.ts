// presentation/routes/passenger-services.routes.ts
import { Router } from 'express';
import { PassengerServiceController } from '../controllers/PassengerServiceController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreatePassengerServiceSchema, UpdatePassengerServiceSchema } from '../../../shared/schemas/validation.schemas.js';

export function createPassengerServiceRouter(controller: PassengerServiceController): Router {
  const router = Router();
  router.get('/',                              authenticate, requireAdmin, controller.list);
  router.get('/by-passenger/:passengerId',     authenticate, controller.listByPassenger);
  router.get('/:id',                           authenticate, controller.getById);
  router.post('/',                             authenticate, validate(CreatePassengerServiceSchema), controller.create);
  router.put('/:id',                           authenticate, requireAdmin, validate(UpdatePassengerServiceSchema), controller.update);
  router.patch('/:id',                         authenticate, requireAdmin, validate(UpdatePassengerServiceSchema), controller.update);
  router.delete('/:id',                        authenticate, requireAdmin, controller.remove);
  return router;
}
