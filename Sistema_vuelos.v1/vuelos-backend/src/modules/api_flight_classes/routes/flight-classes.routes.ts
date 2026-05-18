// presentation/routes/flight-classes.routes.ts
import { Router } from 'express';
import { FlightClassController } from '../controllers/FlightClassController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { requireInternalService }    from '../../../shared/middlewares/internal.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateFlightClassSchema, UpdateFlightClassSchema } from '../../../shared/schemas/validation.schemas.js';
import { IFlightClassService } from '../interfaces/IFlightClassService.js';

export function createFlightClassRouter(controller: FlightClassController): Router {
  const router = Router();
  router.get('/',                      controller.list);
  router.get('/by-flight/:flightId',   controller.listByFlight);
  router.get('/:id',                   controller.getById);
  router.post('/',     authenticate, requireAdmin, validate(CreateFlightClassSchema), controller.create);
  router.put('/:id',   authenticate, requireAdmin, validate(UpdateFlightClassSchema), controller.update);
  router.patch('/:id', authenticate, requireAdmin, validate(UpdateFlightClassSchema), controller.update);
  router.delete('/:id',authenticate, requireAdmin, controller.remove);
  return router;
}

/** Internal routes — accessible only with x-internal-api-key header (service-to-service). */
export function createFlightClassInternalRouter(service: IFlightClassService): Router {
  const router = Router();

  router.patch('/:id/decrement-seats', requireInternalService, async (req, res, next) => {
    try {
      const count = Number(req.body?.count);
      if (!count || count < 1) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'count debe ser >= 1' } });
        return;
      }
      await service.decrementSeats(String(req.params.id), count);
      res.json({ success: true });
    } catch (err: any) {
      if (err?.code === 'NO_AVAILABILITY') {
        res.status(409).json({ success: false, error: { code: 'NO_AVAILABILITY', message: err.message } });
        return;
      }
      next(err);
    }
  });

  router.patch('/:id/increment-seats', requireInternalService, async (req, res, next) => {
    try {
      const count = Number(req.body?.count);
      if (!count || count < 1) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'count debe ser >= 1' } });
        return;
      }
      await service.incrementSeats(String(req.params.id), count);
      res.json({ success: true });
    } catch (err) { next(err); }
  });

  return router;
}
