// presentation/routes/invoice-items.routes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { InvoiceItemController } from '../controllers/InvoiceItemController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { requireInvoiceItemOwner, requireInvoiceOwnerById } from '../../../shared/middlewares/ownership.middleware.js';
import { CreateInvoiceItemSchema, UpdateInvoiceItemSchema } from '../../../shared/schemas/validation.schemas.js';

export function createInvoiceItemRouter(controller: InvoiceItemController, db: PrismaClient): Router {
  const router = Router();
  router.get('/',                        authenticate, requireAdmin, controller.list);
  router.get('/by-invoice/:invoiceId',   authenticate, requireInvoiceOwnerById(db, req => req.params.invoiceId), controller.listByInvoice);
  router.get('/:id',                     authenticate, requireInvoiceItemOwner(db, req => req.params.id), controller.getById);
  router.post('/',                       authenticate, requireAdmin, validate(CreateInvoiceItemSchema), controller.create);
  router.put('/:id',                     authenticate, requireAdmin, validate(UpdateInvoiceItemSchema), controller.update);
  router.patch('/:id',                   authenticate, requireAdmin, validate(UpdateInvoiceItemSchema), controller.update);
  router.delete('/:id',                  authenticate, requireAdmin, controller.remove);
  return router;
}
