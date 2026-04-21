// presentation/routes/flights.routes.ts
import { Router } from 'express';
import { FlightController } from '../controllers/FlightController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate, validateQuery } from '../../../shared/middlewares/validate.middleware.js';
import { CreateFlightSchema, UpdateFlightSchema, FlightSearchQuerySchema } from '../../../shared/schemas/validation.schemas.js';

export function createFlightRouter(controller: FlightController): Router {
  const router = Router();
  router.get('/',         controller.list);
  router.get('/search',   validateQuery(FlightSearchQuerySchema), controller.search);
  router.get('/:id',      controller.getById);
  router.post('/',        authenticate, requireAdmin, validate(CreateFlightSchema), controller.create);
  router.put('/:id',      authenticate, requireAdmin, validate(UpdateFlightSchema), controller.update);
  router.patch('/:id',    authenticate, requireAdmin, validate(UpdateFlightSchema), controller.update);
  router.delete('/:id',   authenticate, requireAdmin, controller.remove);
  return router;
}
