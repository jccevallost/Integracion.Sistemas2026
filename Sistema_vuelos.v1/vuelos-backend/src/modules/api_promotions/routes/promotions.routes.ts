// presentation/routes/promotions.routes.ts
import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreatePromotionSchema, ValidatePromotionSchema } from '../../../shared/schemas/validation.schemas.js';

export function createPromotionRouter(controller: PromotionController): Router {
  const router = Router();
  router.get('/',          authenticate, requireAdmin, controller.list);
  router.post('/validate', validate(ValidatePromotionSchema), controller.validate);
  router.post('/',         authenticate, requireAdmin, validate(CreatePromotionSchema), controller.create);
  router.patch('/:id',     authenticate, requireAdmin, controller.update);
  router.delete('/:id',    authenticate, requireAdmin, controller.remove);
  return router;
}
