// presentation/routes/audit-logs.routes.ts
import { Router } from 'express';
import { AuditLogController } from '../controllers/AuditLogController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createAuditLogRouter(controller: AuditLogController): Router {
  const router = Router();
  router.get('/',                    authenticate, requireAdmin, controller.list);
  router.get('/by-user/:userId',     authenticate, requireAdmin, controller.listByUser);
  router.get('/by-entity',           authenticate, requireAdmin, controller.listByEntity);
  router.get('/:id',                 authenticate, requireAdmin, controller.getById);
  router.post('/',                   authenticate, requireAdmin, controller.create);
  return router;
}
