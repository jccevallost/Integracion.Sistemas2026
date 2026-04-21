// presentation/routes/airline-service-config.routes.ts
import { Router } from 'express';
import { AirlineServiceConfigController } from '../controllers/AirlineServiceConfigController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createAirlineServiceConfigRouter(controller: AirlineServiceConfigController): Router {
  const router = Router();
  router.get('/',                          controller.list);
  router.get('/by-airline/:airlineId',     controller.listByAirline);
  router.get('/:id',                       controller.getById);
  router.post('/',     authenticate, requireAdmin, controller.create);
  router.put('/:id',   authenticate, requireAdmin, controller.update);
  router.patch('/:id', authenticate, requireAdmin, controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}
