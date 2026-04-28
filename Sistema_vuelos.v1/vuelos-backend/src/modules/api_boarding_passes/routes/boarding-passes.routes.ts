// presentation/routes/boarding-passes.routes.ts
import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { BoardingPassController } from '../controllers/BoardingPassController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import {
  requireBoardingPassCreateAllowed,
  requireBoardingPassOwner,
  requirePassengerOwner,
} from '../../../shared/middlewares/ownership.middleware.js';
import { CreateBoardingPassSchema, UpdateBoardingPassSchema } from '../../../shared/schemas/validation.schemas.js';

export function createBoardingPassRouter(controller: BoardingPassController, db: PrismaClient): Router {
  const router = Router();
  router.get('/',                              authenticate, requireAdmin, controller.list);
  router.get('/by-passenger/:passengerId',     authenticate, requirePassengerOwner(db, req => req.params.passengerId), controller.listByPassenger);
  router.get('/:id',                           authenticate, requireBoardingPassOwner(db, req => req.params.id), controller.getById);
  router.post('/',                             authenticate, validate(CreateBoardingPassSchema), requireBoardingPassCreateAllowed(db), controller.create);
  router.put('/:id',                           authenticate, requireAdmin, validate(UpdateBoardingPassSchema), controller.update);
  router.patch('/:id',                         authenticate, requireAdmin, validate(UpdateBoardingPassSchema), controller.update);
  router.delete('/:id',                        authenticate, requireAdmin, controller.remove);
  return router;
}
