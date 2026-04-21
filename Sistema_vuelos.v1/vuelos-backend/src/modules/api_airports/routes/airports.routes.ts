// presentation/routes/airports.routes.ts
import { Router } from 'express';
import { AirportController } from '../controllers/AirportController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateAirportSchema, UpdateAirportSchema } from '../../../shared/schemas/validation.schemas.js';

export function createAirportRouter(controller: AirportController): Router {
  const router = Router();
  router.get('/',        controller.list);
  router.get('/search',  controller.search);
  router.get('/:id',     controller.getById);
  router.post('/',       authenticate, requireAdmin, validate(CreateAirportSchema), controller.create);
  router.put('/:id',     authenticate, requireAdmin, validate(UpdateAirportSchema), controller.update);
  router.patch('/:id',   authenticate, requireAdmin, validate(UpdateAirportSchema), controller.update);
  router.delete('/:id',  authenticate, requireAdmin, controller.remove);
  return router;
}
