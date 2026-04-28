// presentation/routes/invoices.routes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { InvoiceController } from '../controllers/InvoiceController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import {
  requireBillingProfileOwner,
  requireInvoiceOwner,
  requirePaymentOwnerForInvoice,
} from '../../../shared/middlewares/ownership.middleware.js';

export function createInvoiceRouter(controller: InvoiceController, db: PrismaClient): Router {
  const router = Router();
  router.get('/',                                        authenticate, requireAdmin, controller.list);
  router.get('/by-billing-profile/:billingProfileId',    authenticate, requireBillingProfileOwner(db, req => req.params.billingProfileId), controller.listByBillingProfile);
  router.get('/by-payment/:paymentId',                   authenticate, requirePaymentOwnerForInvoice(db, req => req.params.paymentId), controller.getByPayment);
  router.get('/:id',                                     authenticate, requireInvoiceOwner(db, req => req.params.id), controller.getById);
  router.post('/',                                       authenticate, requireAdmin, controller.create);
  router.put('/:id',                                     authenticate, requireAdmin, controller.update);
  router.patch('/:id',                                   authenticate, requireAdmin, controller.update);
  router.delete('/:id',                                  authenticate, requireAdmin, controller.remove);
  return router;
}
