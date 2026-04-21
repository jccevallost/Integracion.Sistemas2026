// presentation/routes/countries.routes.ts
import { Router } from 'express';
import { CountryController } from '../controllers/CountryController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateCountrySchema, UpdateCountrySchema } from '../../../shared/schemas/validation.schemas.js';

export function createCountryRouter(controller: CountryController): Router {
  const router = Router();
  router.get('/',      controller.list);
  router.get('/:id',   controller.getById);
  router.post('/',     authenticate, requireAdmin, validate(CreateCountrySchema), controller.create);
  router.put('/:id',   authenticate, requireAdmin, validate(UpdateCountrySchema), controller.update);
  router.patch('/:id', authenticate, requireAdmin, validate(UpdateCountrySchema), controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}
