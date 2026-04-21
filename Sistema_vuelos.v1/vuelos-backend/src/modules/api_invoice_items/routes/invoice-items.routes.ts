// presentation/routes/invoice-items.routes.ts
import { Router } from 'express';
import { InvoiceItemController } from '../controllers/InvoiceItemController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createInvoiceItemRouter(controller: InvoiceItemController): Router {
  const router = Router();
  router.get('/',                        authenticate, requireAdmin, controller.list);
  router.get('/by-invoice/:invoiceId',   authenticate, controller.listByInvoice);
  router.get('/:id',                     authenticate, controller.getById);
  router.post('/',                       authenticate, requireAdmin, controller.create);
  router.put('/:id',                     authenticate, requireAdmin, controller.update);
  router.patch('/:id',                   authenticate, requireAdmin, controller.update);
  router.delete('/:id',                  authenticate, requireAdmin, controller.remove);
  return router;
}
