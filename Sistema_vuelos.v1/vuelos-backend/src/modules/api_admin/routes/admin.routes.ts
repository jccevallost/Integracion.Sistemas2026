// presentation/routes/admin.routes.ts
// Rutas del panel de administración — todas requieren rol ADMIN
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authenticate, requireAdmin } from '../../../shared/middlewares/auth.middleware.js';
import { validate } from '../../../shared/middlewares/validate.middleware.js';
import { CreateFlightClassSchema, UpdateFlightClassSchema, CreateSegmentSchema, UpdateSegmentSchema } from '../../../shared/schemas/validation.schemas.js';
import type { ZodSchema } from 'zod';
import type { PrismaClient } from '@prisma/client';

type AdminRouterClients = {
  auth?: PrismaClient;
  catalog?: PrismaClient;
  flights?: PrismaClient;
  booking?: PrismaClient;
  payments?: PrismaClient;
  audit?: PrismaClient;
};

async function audit(db: PrismaClient, req: any, action: string, entity: string, entityId: string, oldData: any, newData: any) {
  try {
    await db.auditLog.create({
      data: {
        userId:    (req as any).user?.id ?? null,
        action,
        entity,
        entityId,
        oldData:   oldData  ?? undefined,
        newData:   newData  ?? undefined,
        ipAddress: req.ip   ?? null,
        userAgent: (req.headers['user-agent'] as string | undefined) ?? null,
      },
    });
  } catch { /* auditoría no bloquea la operación */ }
}

// Repositorios genéricos usados directamente para CRUD simple de catálogos
function makeGenericRouter(
  db: PrismaClient,
  model: any,
  include?: object,
  schemas?: { create?: ZodSchema; update?: ZodSchema },
  customDelete?: (req: any, res: any, next: any) => Promise<void>,
  auditDb: PrismaClient = db,
): Router {
  const entityName = String(model);
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
  const createMiddlewares: any[] = schemas?.create ? [validate(schemas.create)] : [];
  router.post('/', ...createMiddlewares, async (req: any, res: any, next: any) => {
    try {
      const data = await (db as any)[model].create({ data: req.body, include });
      await audit(auditDb, req, 'CREATE', entityName, data.id, null, data);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  });
  const updateMiddlewares: any[] = schemas?.update ? [validate(schemas.update)] : [];
  const updateHandler = async (req: any, res: any, next: any) => {
    try {
      const id = String(req.params.id);
      const oldData = await (db as any)[model].findUnique({ where: { id } });
      const data = await (db as any)[model].update({ where: { id }, data: req.body, include });
      await audit(auditDb, req, 'UPDATE', entityName, id, oldData, data);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };
  router.patch('/:id', ...updateMiddlewares, updateHandler);
  router.put('/:id',   ...updateMiddlewares, updateHandler);
  if (customDelete) {
    router.delete('/:id', customDelete);
  } else {
    router.delete('/:id', async (req, res, next) => {
      try {
        const id = String(req.params.id);
        const oldData = await (db as any)[model].findUnique({ where: { id } });
        await (db as any)[model].delete({ where: { id } });
        await audit(auditDb, req, 'DELETE', entityName, id, oldData, null);
        res.json({ success: true, data: { deleted: true } });
      } catch (err) { next(err); }
    });
  }
  return router;
}

export function createAdminRouter(controller: AdminController, db: PrismaClient, clients: AdminRouterClients = {}): Router {
  const router = Router();
  const auth = [authenticate, requireAdmin];
  const authDb = clients.auth ?? db;
  const catalogDb = clients.catalog ?? db;
  const flightsDb = clients.flights ?? db;
  const bookingDb = clients.booking ?? db;
  const paymentsDb = clients.payments ?? db;
  const auditDb = clients.audit ?? db;
  const splitDomains = Object.keys(clients).length > 0;
  const includeIfAvailable = <T extends object>(include: T): T | undefined => (splitDomains ? undefined : include);

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
        const city = await catalogDb.city.findFirst({ select: { id: true }, orderBy: { name: 'asc' } });
        cityId = city?.id;
      }
      const mainAddress = rest.mainAddress ?? 'Sin dirección';
      const user = await authDb.user.create({
        data: { ...rest, mainAddress, cityId, passwordHash },
        include: includeIfAvailable({ city: { include: { country: true } } }),
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
      const user = await authDb.user.update({
        where: { id: String(req.params.id) },
        data: updateData,
        include: includeIfAvailable({ city: { include: { country: true } } }),
      });
      const { passwordHash: _ph, ...safe } = user as any;
      res.json({ success: true, data: safe });
    } catch (err) { next(err); }
  };
  router.patch('/users/:id',  ...auth, updateUserHandler);
  router.put('/users/:id',    ...auth, updateUserHandler);
  router.delete('/users/:id', ...auth, controller.deleteUser);

  // ── Catálogos geográficos ────────────────────────────────────
  router.use('/countries', ...auth, makeGenericRouter(catalogDb, 'country', undefined, undefined, undefined, auditDb));
  router.use('/cities',    ...auth, makeGenericRouter(catalogDb, 'city',    includeIfAvailable({ country: true }), undefined, undefined, auditDb));
  router.use('/airports',  ...auth, makeGenericRouter(catalogDb, 'airport', includeIfAvailable({ city: { include: { country: true } } }), undefined, undefined, auditDb));

  // ── Aerolíneas y aeronaves ───────────────────────────────────
  router.use('/airlines',  ...auth, makeGenericRouter(catalogDb, 'airline',  includeIfAvailable({ country: true }), undefined, undefined, auditDb));
  router.use('/aircraft',  ...auth, makeGenericRouter(catalogDb, 'aircraft', includeIfAvailable({ airline: true }), undefined, undefined, auditDb));

  // ── Relación aerolínea-aeropuerto ───────────────────────────
  router.get('/airline-airports', ...auth, async (_req, res, next) => {
    try {
      const data = await catalogDb.airlineAirport.findMany({ include: includeIfAvailable({ airline: true, airport: true }) });
      res.json({ success: true, data: { data, pagination: { total: data.length } } });
    } catch (err) { next(err); }
  });
  router.post('/airline-airports', ...auth, async (req, res, next) => {
    try {
      const { airlineId, airportId } = req.body;
      const data = await catalogDb.airlineAirport.create({ data: { airlineId, airportId }, include: includeIfAvailable({ airline: true, airport: true }) });
      await audit(auditDb, req, 'CREATE', 'airlineAirport', `${airlineId}_${airportId}`, null, data);
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  });
  router.delete('/airline-airports/:airlineId/:airportId', ...auth, async (req, res, next) => {
    try {
      const airlineId = String(req.params.airlineId);
      const airportId = String(req.params.airportId);
      const oldData = await catalogDb.airlineAirport.findFirst({ where: { airlineId, airportId } });
      await catalogDb.airlineAirport.delete({ where: { airlineId_airportId: { airlineId: String(airlineId), airportId: String(airportId) } } });
      await audit(auditDb, req, 'DELETE', 'airlineAirport', `${airlineId}_${airportId}`, oldData, null);
      res.json({ success: true, data: { deleted: true } });
    } catch (err) { next(err); }
  });

  // ── Vuelos ──────────────────────────────────────────────────
  router.use('/flightclasses', ...auth, makeGenericRouter(flightsDb, 'flightClass', includeIfAvailable({ flight: true }), { create: CreateFlightClassSchema, update: UpdateFlightClassSchema }, undefined, auditDb));
  router.use('/segments',      ...auth, makeGenericRouter(flightsDb, 'segment', includeIfAvailable({
    originAirport: true,
    destinationAirport: true,
    airline: true,
    aircraft: true,
  }), { create: CreateSegmentSchema, update: UpdateSegmentSchema }, undefined, auditDb));

  // ── Reservas y pasajeros ────────────────────────────────────
  router.use('/reservations', ...auth, makeGenericRouter(
    bookingDb, 'reservation',
    includeIfAvailable({ passengers: true, flight: true, user: { select: { id: true, email: true, firstName: true, firstLastName: true } } }),
    undefined,
    async (req, res, next) => {
      const id = String(req.params.id);
      try {
        const payment = await paymentsDb.payment.findUnique({ where: { reservationId: id }, select: { id: true } });
        if (payment) {
          const invoice = await paymentsDb.invoice.findUnique({ where: { paymentId: payment.id }, select: { id: true } });
          if (invoice) {
            await paymentsDb.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
            await paymentsDb.invoice.delete({ where: { id: invoice.id } });
          }
          await paymentsDb.payment.delete({ where: { id: payment.id } });
        }
        await bookingDb.$transaction(async (tx) => {
          const passengers = await tx.reservationPassenger.findMany({ where: { reservationId: id }, select: { id: true } });
          const pids = passengers.map((p) => p.id);
          if (pids.length) {
            await tx.passengerService.deleteMany({ where: { passengerId: { in: pids } } });
            await tx.boardingPass.deleteMany({ where: { passengerId: { in: pids } } });
            await tx.reservationPassenger.deleteMany({ where: { reservationId: id } });
          }
          await tx.reservation.delete({ where: { id } });
        });
        await audit(auditDb, req, 'DELETE', 'reservation', id, null, null);
        res.json({ success: true, data: { deleted: true } });
      } catch (err) { next(err); }
    },
    auditDb,
  ));
  router.use('/reservation-passengers', ...auth, makeGenericRouter(bookingDb, 'reservationPassenger', includeIfAvailable({
    reservation: { select: { id: true, reservationCode: true } },
    flightClass: true,
  }), undefined, undefined, auditDb));

  // ── Servicios y configuración ───────────────────────────────
  router.use('/servicecatalog',        ...auth, makeGenericRouter(catalogDb, 'serviceCatalog', undefined, undefined, undefined, auditDb));
  router.use('/airline-service-config',...auth, makeGenericRouter(catalogDb, 'airlineServiceConfig', includeIfAvailable({
    service: true,
    airline: true,
  }), undefined, undefined, auditDb));
  router.use('/passenger-services', ...auth, makeGenericRouter(bookingDb, 'passengerService', includeIfAvailable({
    passenger: true,
    serviceConfig: { include: { service: true } },
  }), undefined, undefined, auditDb));

  // ── Promociones ─────────────────────────────────────────────
  router.use('/promotions', ...auth, makeGenericRouter(flightsDb, 'promotion', undefined, undefined, undefined, auditDb));

  // ── Pagos y facturación ─────────────────────────────────────
  router.use('/payments', ...auth, makeGenericRouter(paymentsDb, 'payment', includeIfAvailable({
    reservation: { select: { id: true, reservationCode: true, totalAmount: true } },
  }), undefined, undefined, auditDb));
  router.use('/billing-profiles', ...auth, makeGenericRouter(paymentsDb, 'billingProfile', includeIfAvailable({
    city: { include: { country: true } },
  }), undefined, undefined, auditDb));
  router.use('/invoices', ...auth, makeGenericRouter(paymentsDb, 'invoice', includeIfAvailable({
    payment: true,
    billingProfile: true,
    items: true,
  }), undefined, undefined, auditDb));
  router.use('/invoice-items', ...auth, makeGenericRouter(paymentsDb, 'invoiceItem', undefined, undefined, undefined, auditDb));

  // ── Embarque ────────────────────────────────────────────────
  router.use('/boarding-passes', ...auth, makeGenericRouter(bookingDb, 'boardingPass', includeIfAvailable({
    passenger: true,
    segment: { include: { originAirport: true, destinationAirport: true, airline: true } },
  }), undefined, undefined, auditDb));

  // ── Auditoría ────────────────────────────────────────────────
  router.use('/auditlogs', ...auth, makeGenericRouter(auditDb, 'auditLog'));

  return router;
}
