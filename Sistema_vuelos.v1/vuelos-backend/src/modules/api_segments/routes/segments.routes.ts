// presentation/routes/segments.routes.ts
import { Router } from 'express';
import { SegmentController } from '../controllers/SegmentController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateSegmentSchema, UpdateSegmentSchema } from '../../../shared/schemas/validation.schemas.js';

export function createSegmentRouter(controller: SegmentController): Router {
  const router = Router();
  router.get('/',                      controller.list);
  router.get('/by-flight/:flightId',   controller.listByFlight);
  router.get('/:id',                   controller.getById);
  router.post('/',     authenticate, requireAdmin, validate(CreateSegmentSchema), controller.create);
  router.put('/:id',   authenticate, requireAdmin, validate(UpdateSegmentSchema), controller.update);
  router.patch('/:id', authenticate, requireAdmin, validate(UpdateSegmentSchema), controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}
