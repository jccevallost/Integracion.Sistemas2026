// presentation/routes/flight-classes.routes.ts
import { Router } from 'express';
import { FlightClassController } from '../controllers/FlightClassController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateFlightClassSchema, UpdateFlightClassSchema } from '../../../shared/schemas/validation.schemas.js';

export function createFlightClassRouter(controller: FlightClassController): Router {
  const router = Router();
  router.get('/',                      controller.list);
  router.get('/by-flight/:flightId',   controller.listByFlight);
  router.get('/:id',                   controller.getById);
  router.post('/',     authenticate, requireAdmin, validate(CreateFlightClassSchema), controller.create);
  router.put('/:id',   authenticate, requireAdmin, validate(UpdateFlightClassSchema), controller.update);
  router.patch('/:id', authenticate, requireAdmin, validate(UpdateFlightClassSchema), controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}
