// presentation/routes/admin.routes.ts
// Rutas del panel de administración — todas requieren rol ADMIN
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { PrismaClient } from '@prisma/client';

// Repositorios genéricos usados directamente para CRUD simple de catálogos
function makeGenericRouter(db: PrismaClient, model: any, include?: object): Router {
  const router = Router();
  router.get('/', async (_req, res, next) => {
    try {
      const data = await (db as any)[model].findMany({ include });
      res.json({ success: true, data: { data, pagination: { total: data.length } } });
    } catch (err) { next(err); }
  });
  router.get('/:id', async (req, res, next) => {
    try {
      const data = await (db as any)[model].findUnique({ where: { id: String(req.params.id) }, include });
      if (!data) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No encontrado' } }); return; }
      res.json({ success: true, data });
    } catch (err) { next(err); }
  });
  router.post('/', async (req, res, next) => {
    try {
      const data = await (db as any)[model].create({ data: req.body, include });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  });
  // Acepta tanto PATCH (actualización parcial) como PUT (reemplazo completo)
  const updateHandler = async (req: any, res: any, next: any) => {
    try {
      const data = await (db as any)[model].update({ where: { id: String(req.params.id) }, data: req.body, include });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };
  router.patch('/:id', updateHandler);
  router.put('/:id',   updateHandler);
  router.delete('/:id', async (req, res, next) => {
    try {
      await (db as any)[model].delete({ where: { id: String(req.params.id) } });
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  });
  return router;
}

export function createAdminRouter(controller: AdminController, db: PrismaClient): Router {
  const router = Router();
  const auth = [authenticate, requireAdmin];

  // Dashboard
  router.get('/dashboard', ...auth, controller.dashboard);

  // Users
  router.get('/users',        ...auth, controller.listUsers);
  router.post('/users',       ...auth, async (req, res, next) => {
    try {
      const bcrypt = await import('bcryptjs');
      const { password, cityId: rawCityId, ...rest } = req.body;
      if (!password) { res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'password es requerido' } }); return; }
      const passwordHash = await bcrypt.default.hash(String(password), 10);
      let cityId = rawCityId;
      if (!cityId) {
        const city = await db.city.findFirst({ select: { id: true }, orderBy: { name: 'asc' } });
        cityId = city?.id;
      }
      const mainAddress = rest.mainAddress ?? 'Sin dirección';
      const user = await db.user.create({
        data: { ...rest, mainAddress, cityId, passwordHash },
        include: { city: { include: { country: true } } },
      });
      const { passwordHash: _ph, ...safe } = user as any;
      res.status(201).json({ success: true, data: safe });
    } catch (err) { next(err); }
  });
  // PATCH / PUT usuarios — maneja re-hash de password si se envía
  const updateUserHandler = async (req: any, res: any, next: any) => {
    try {
      const bcrypt = await import('bcryptjs');
      const { password, birthDate, cityId, ...rest } = req.body;
      const updateData: Record<string, unknown> = { ...rest };
      if (password)   updateData.passwordHash = await bcrypt.default.hash(String(password), 10);
      if (birthDate)  updateData.birthDate    = new Date(birthDate);
      if (cityId)     updateData.cityId       = cityId;
      const user = await db.user.update({
        where: { id: String(req.params.id) },
        data: updateData,
        include: { city: { include: { country: true } } },
      });
      const { passwordHash: _ph, ...safe } = user as any;
      res.json({ success: true, data: safe });
    } catch (err) { next(err); }
  };
  router.patch('/users/:id',  ...auth, updateUserHandler);
  router.put('/users/:id',    ...auth, updateUserHandler);
  router.delete('/users/:id', ...auth, controller.deleteUser);

  // ── Catálogos geográficos ────────────────────────────────────
  router.use('/countries', ...auth, makeGenericRouter(db, 'country'));
  router.use('/cities',    ...auth, makeGenericRouter(db, 'city',    { country: true }));
  router.use('/airports',  ...auth, makeGenericRouter(db, 'airport', { city: { include: { country: true } } }));

  // ── Aerolíneas y aeronaves ───────────────────────────────────
  router.use('/airlines',  ...auth, makeGenericRouter(db, 'airline',  { country: true }));
  router.use('/aircraft',  ...auth, makeGenericRouter(db, 'aircraft', { airline: true }));

  // ── Relación aerolínea-aeropuerto ───────────────────────────
  router.get('/airline-airports', ...auth, async (_req, res, next) => {
    try {
      const data = await db.airlineAirport.findMany({ include: { airline: true, airport: true } });
      res.json({ success: true, data: { data, pagination: { total: data.length } } });
    } catch (err) { next(err); }
  });
  router.post('/airline-airports', ...auth, async (req, res, next) => {
    try {
      const { airlineId, airportId } = req.body;
      const data = await db.airlineAirport.create({ data: { airlineId, airportId }, include: { airline: true, airport: true } });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  });
  router.delete('/airline-airports/:airlineId/:airportId', ...auth, async (req, res, next) => {
    try {
      await db.airlineAirport.delete({ where: { airlineId_airportId: { airlineId: String(req.params.airlineId), airportId: String(req.params.airportId) } } });
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  });

  // ── Vuelos ──────────────────────────────────────────────────
  router.use('/flightclasses', ...auth, makeGenericRouter(db, 'flightClass', { flight: true }));
  router.use('/segments',      ...auth, makeGenericRouter(db, 'segment', {
    originAirport: true,
    destinationAirport: true,
    airline: true,
    aircraft: true,
  }));

  // ── Reservas y pasajeros ────────────────────────────────────
  router.use('/reservations', ...auth, makeGenericRouter(db, 'reservation', {
    passengers: true,
    flight: true,
    user: { select: { id: true, email: true, firstName: true, firstLastName: true } },
  }));
  router.use('/reservation-passengers', ...auth, makeGenericRouter(db, 'reservationPassenger', {
    reservation: { select: { id: true, reservationCode: true } },
    flightClass: true,
  }));

  // ── Servicios y configuración ───────────────────────────────
  router.use('/servicecatalog',        ...auth, makeGenericRouter(db, 'serviceCatalog'));
  router.use('/airline-service-config',...auth, makeGenericRouter(db, 'airlineServiceConfig', {
    service: true,
    airline: true,
  }));
  router.use('/passenger-services', ...auth, makeGenericRouter(db, 'passengerService', {
    passenger: true,
    serviceConfig: { include: { service: true } },
  }));

  // ── Promociones ─────────────────────────────────────────────
  router.use('/promotions', ...auth, makeGenericRouter(db, 'promotion'));

  // ── Pagos y facturación ─────────────────────────────────────
  router.use('/payments', ...auth, makeGenericRouter(db, 'payment', {
    reservation: { select: { id: true, reservationCode: true, totalAmount: true } },
  }));
  router.use('/billing-profiles', ...auth, makeGenericRouter(db, 'billingProfile', {
    city: { include: { country: true } },
  }));
  router.use('/invoices', ...auth, makeGenericRouter(db, 'invoice', {
    payment: true,
    billingProfile: true,
    items: true,
  }));
  router.use('/invoice-items', ...auth, makeGenericRouter(db, 'invoiceItem'));

  // ── Embarque ────────────────────────────────────────────────
  router.use('/boarding-passes', ...auth, makeGenericRouter(db, 'boardingPass', {
    passenger: true,
    segment: { include: { originAirport: true, destinationAirport: true, airline: true } },
  }));

  // ── Auditoría ────────────────────────────────────────────────
  router.use('/auditlogs', ...auth, makeGenericRouter(db, 'auditLog'));

  return router;
}
