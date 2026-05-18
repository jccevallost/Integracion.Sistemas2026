// presentation/routes/promotions.routes.ts
import { Router } from 'express';
import { PromotionController } from '../controllers/PromotionController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { requireInternalService }    from '../../../shared/middlewares/internal.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreatePromotionSchema, UpdatePromotionSchema, ValidatePromotionSchema } from '../../../shared/schemas/validation.schemas.js';
import { IPromotionService } from '../interfaces/IPromotionService.js';

export function createPromotionRouter(controller: PromotionController): Router {
  const router = Router();
  router.get('/',          authenticate, requireAdmin, controller.list);
  router.post('/validate', validate(ValidatePromotionSchema), controller.validate);
  router.post('/',         authenticate, requireAdmin, validate(CreatePromotionSchema), controller.create);
  router.patch('/:id',     authenticate, requireAdmin, validate(UpdatePromotionSchema), controller.update);
  router.delete('/:id',    authenticate, requireAdmin, controller.remove);
  return router;
}

/** Internal routes — accessible only with x-internal-api-key header (service-to-service). */
export function createPromotionInternalRouter(service: IPromotionService): Router {
  const router = Router();

  router.get('/by-code/:code', requireInternalService, async (req, res, next) => {
    try {
      const promo = await service.findByCode(decodeURIComponent(String(req.params.code)));
      if (!promo) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Promoción no encontrada' } });
        return;
      }
      res.json({ success: true, data: promo });
    } catch (err) { next(err); }
  });

  router.patch('/:id/increment-usage', requireInternalService, async (req, res, next) => {
    try {
      await service.incrementUsage(String(req.params.id));
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  router.patch('/:id/decrement-usage', requireInternalService, async (req, res, next) => {
    try {
      await service.decrementUsage(String(req.params.id));
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  return router;
}
