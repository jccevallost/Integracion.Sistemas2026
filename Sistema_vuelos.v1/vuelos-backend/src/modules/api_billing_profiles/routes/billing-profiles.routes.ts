// presentation/routes/billing-profiles.routes.ts
import { Router } from 'express';
import { BillingProfileController } from '../controllers/BillingProfileController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createBillingProfileRouter(controller: BillingProfileController): Router {
  const router = Router();
  router.get('/',                        authenticate, controller.list);
  router.get('/my',                      authenticate, controller.listByUser);
  router.get('/by-user/:userId',         authenticate, requireAdmin, controller.listByUser);
  router.get('/:id',                     authenticate, controller.getById);
  router.post('/',                       authenticate, controller.create);
  router.put('/:id',                     authenticate, controller.update);
  router.patch('/:id',                   authenticate, controller.update);
  router.delete('/:id',                  authenticate, controller.remove);
  return router;
}
