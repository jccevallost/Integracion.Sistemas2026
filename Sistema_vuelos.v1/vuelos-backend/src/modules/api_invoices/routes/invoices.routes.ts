// presentation/routes/invoices.routes.ts
import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createInvoiceRouter(controller: InvoiceController): Router {
  const router = Router();
  router.get('/',                                        authenticate, requireAdmin, controller.list);
  router.get('/by-billing-profile/:billingProfileId',    authenticate, controller.listByBillingProfile);
  router.get('/by-payment/:paymentId',                   authenticate, controller.getByPayment);
  router.get('/:id',                                     authenticate, controller.getById);
  router.post('/',                                       authenticate, requireAdmin, controller.create);
  router.put('/:id',                                     authenticate, requireAdmin, controller.update);
  router.patch('/:id',                                   authenticate, requireAdmin, controller.update);
  router.delete('/:id',                                  authenticate, requireAdmin, controller.remove);
  return router;
}
