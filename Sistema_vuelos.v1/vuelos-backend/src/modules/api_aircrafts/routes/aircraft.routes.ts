// presentation/routes/aircraft.routes.ts
import { Router } from 'express';
import { AircraftController } from '../controllers/AircraftController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createAircraftRouter(controller: AircraftController): Router {
  const router = Router();
  router.get('/',      controller.list);
  router.get('/:id',   controller.getById);
  router.post('/',     authenticate, requireAdmin, controller.create);
  router.put('/:id',   authenticate, requireAdmin, controller.update);
  router.patch('/:id', authenticate, requireAdmin, controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}
