// presentation/routes/airline-airports.routes.ts
import { Router } from 'express';
import { AirlineAirportController } from '../controllers/AirlineAirportController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';

export function createAirlineAirportRouter(controller: AirlineAirportController): Router {
  const router = Router();
  router.get('/',                                    controller.list);
  router.get('/by-airline/:airlineId',               controller.listByAirline);
  router.get('/by-airport/:airportId',               controller.listByAirport);
  router.post('/',     authenticate, requireAdmin,   controller.create);
  router.delete('/:airlineId/:airportId', authenticate, requireAdmin, controller.remove);
  return router;
}
