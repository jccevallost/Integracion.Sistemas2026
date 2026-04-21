// presentation/routes/boarding-passes.routes.ts
import { Router } from 'express';
import { BoardingPassController } from '../controllers/BoardingPassController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateBoardingPassSchema, UpdateBoardingPassSchema } from '../../../shared/schemas/validation.schemas.js';

export function createBoardingPassRouter(controller: BoardingPassController): Router {
  const router = Router();
  router.get('/',                              authenticate, requireAdmin, controller.list);
  router.get('/by-passenger/:passengerId',     authenticate, controller.listByPassenger);
  router.get('/:id',                           authenticate, controller.getById);
  router.post('/',                             authenticate, validate(CreateBoardingPassSchema), controller.create);
  router.put('/:id',                           authenticate, requireAdmin, validate(UpdateBoardingPassSchema), controller.update);
  router.patch('/:id',                         authenticate, requireAdmin, validate(UpdateBoardingPassSchema), controller.update);
  router.delete('/:id',                        authenticate, requireAdmin, controller.remove);
  return router;
}
