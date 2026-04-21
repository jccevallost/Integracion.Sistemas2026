// presentation/routes/service-catalog.routes.ts
import { Router } from 'express';
import { ServiceCatalogController } from '../controllers/ServiceCatalogController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createServiceCatalogRouter(controller: ServiceCatalogController): Router {
  const router = Router();
  router.get('/',      controller.list);
  router.get('/:id',   controller.getById);
  router.post('/',     authenticate, requireAdmin, controller.create);
  router.put('/:id',   authenticate, requireAdmin, controller.update);
  router.patch('/:id', authenticate, requireAdmin, controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}
