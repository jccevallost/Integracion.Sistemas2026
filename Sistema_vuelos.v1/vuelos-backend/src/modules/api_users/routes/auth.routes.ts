// presentation/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../../../shared/middlewares/auth.middleware.js';

export function createAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.post('/register',         controller.register);
  router.post('/login',            controller.login);
  router.get('/me',                authenticate, controller.me);
  router.put('/profile',           authenticate, controller.updateProfile);
  router.post('/change-password',  authenticate, controller.changePassword);
  return router;
}
