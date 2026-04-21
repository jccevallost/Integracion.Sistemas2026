// presentation/routes/airlines.routes.ts
import { Router } from 'express';
import { AirlineController } from '../controllers/AirlineController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createAirlineRouter(controller: AirlineController): Router {
  const router = Router();
  router.get('/',      controller.list);
  router.get('/:id',   controller.getById);
  router.post('/',     authenticate, requireAdmin, controller.create);
  router.put('/:id',   authenticate, requireAdmin, controller.update);
  router.patch('/:id', authenticate, requireAdmin, controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}
