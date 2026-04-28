// presentation/routes/billing-profiles.routes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { BillingProfileController } from '../controllers/BillingProfileController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { prepareBillingProfileWrite, requireBillingProfileOwner } from '../../../shared/middlewares/ownership.middleware.js';

export function createBillingProfileRouter(controller: BillingProfileController, db: PrismaClient): Router {
  const router = Router();
  router.get('/',                        authenticate, requireAdmin, controller.list);
  router.get('/my',                      authenticate, controller.listByUser);
  router.get('/by-user/:userId',         authenticate, requireAdmin, controller.listByUser);
  router.get('/:id',                     authenticate, requireBillingProfileOwner(db, req => req.params.id), controller.getById);
  router.post('/',                       authenticate, prepareBillingProfileWrite(), controller.create);
  router.put('/:id',                     authenticate, requireBillingProfileOwner(db, req => req.params.id), prepareBillingProfileWrite(), controller.update);
  router.patch('/:id',                   authenticate, requireBillingProfileOwner(db, req => req.params.id), prepareBillingProfileWrite(), controller.update);
  router.delete('/:id',                  authenticate, requireBillingProfileOwner(db, req => req.params.id), controller.remove);
  return router;
}
