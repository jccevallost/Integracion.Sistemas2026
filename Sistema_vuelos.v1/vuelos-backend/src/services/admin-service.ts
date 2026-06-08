import 'dotenv/config';
import { createServiceApp } from '../shared/app-factory.js';
import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { validateJwtConfig } from '../shared/security/jwt.config.js';
import prismaAdmin  from '../shared/database/prisma.admin.client.js';
import prismaAuth   from '../shared/database/prisma.auth.client.js';
import prismaCatalog from '../shared/database/prisma.catalog.client.js';
import prismaFlights from '../shared/database/prisma.flights.client.js';
import prismaBooking from '../shared/database/prisma.booking.client.js';
import prismaPayments from '../shared/database/prisma.payments.client.js';
const prisma = prismaAdmin; // client principal para audit logs

import { UserRepository }    from '../modules/api_users/repositories/UserRepository.js';
import { AuditLogRepository } from '../modules/api_audit_logs/repositories/AuditLogRepository.js';

import {
  AirportQueryRepository,
  FlightQueryRepository,
  ReservationQueryRepository,
  UserQueryRepository,
  AuditLogQueryRepository,
} from '../shared/queries/index.js';

import { UserService }     from '../modules/api_users/services/UserService.js';
import { AuditLogService } from '../modules/api_audit_logs/services/AuditLogService.js';

import { AdminController }   from '../modules/api_admin/controllers/AdminController.js';
import { AuditLogController } from '../modules/api_audit_logs/controllers/AuditLogController.js';

import { createAdminRouter }    from '../modules/api_admin/routes/admin.routes.js';
import { createAuditLogRouter } from '../modules/api_audit_logs/routes/audit-logs.routes.js';

const PORT = Number(process.env.ADMIN_SERVICE_PORT) || 3006;

validateJwtConfig();

// Repositories — cada uno usa el cliente del dominio correcto
const userRepo     = new UserRepository(prismaAuth as any, { includeRelations: false, cityDb: prismaCatalog as any });
const auditLogRepo = new AuditLogRepository(prismaAdmin as any);

// Query repos — cada uno usa el cliente del dominio correcto
const airportQuery     = new AirportQueryRepository(prismaCatalog as any);
const flightQuery      = new FlightQueryRepository(prismaFlights as any);
const reservationQuery = new ReservationQueryRepository(prismaBooking as any);
const userQuery        = new UserQueryRepository(prismaAuth as any);
const auditLogQuery    = new AuditLogQueryRepository(prismaAdmin as any);

// Services
const userService     = new UserService(userRepo);
const auditLogService = new AuditLogService(auditLogRepo);

// Controllers
const adminController   = new AdminController(userService, airportQuery, flightQuery, reservationQuery, userQuery);
const auditLogController = new AuditLogController(auditLogService);

const app = createServiceApp('admin-service');

app.get(['/health', '/'], (_req, res) => {
  res.json({
    service: 'admin-service',
    status: 'online',
    port: PORT,
    version: '2.0.0',
    resources: ['admin', 'audit-logs'],
  });
});

app.use('/api/v1/admin',      createAdminRouter(adminController, prismaAuth as any, {
  auth: prismaAuth as any,
  catalog: prismaCatalog as any,
  flights: prismaFlights as any,
  booking: prismaBooking as any,
  payments: prismaPayments as any,
  audit: prismaAdmin as any,
}));
app.use('/api/v1/audit-logs', createAuditLogRouter(auditLogController));
app.use('/api/admin',         createAdminRouter(adminController, prismaAuth as any, {
  auth: prismaAuth as any,
  catalog: prismaCatalog as any,
  flights: prismaFlights as any,
  booking: prismaBooking as any,
  payments: prismaPayments as any,
  audit: prismaAdmin as any,
}));

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Ruta ${req.originalUrl} no encontrada` } });
});
app.use(errorHandler);

async function start() {
  await Promise.all([
    prismaAdmin.$connect(),
    prismaAuth.$connect(),
    prismaCatalog.$connect(),
    prismaFlights.$connect(),
    prismaBooking.$connect(),
    prismaPayments.$connect(),
  ]);
  app.listen(PORT, () => console.log(`🚀 [admin-service] → http://localhost:${PORT}`));
}

process.on('SIGINT',  async () => {
  await Promise.allSettled([prismaAdmin.$disconnect(), prismaAuth.$disconnect(), prismaCatalog.$disconnect(), prismaFlights.$disconnect(), prismaBooking.$disconnect(), prismaPayments.$disconnect()]);
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await Promise.allSettled([prismaAdmin.$disconnect(), prismaAuth.$disconnect(), prismaCatalog.$disconnect(), prismaFlights.$disconnect(), prismaBooking.$disconnect(), prismaPayments.$disconnect()]);
  process.exit(0);
});
process.on('uncaughtException',  (err) => { console.error('[admin-service] Excepción:', err); process.exit(1); });
process.on('unhandledRejection', (r)   => { console.error('[admin-service] Promesa rechazada:', r); process.exit(1); });

start().catch((err) => { console.error('[admin-service] Error al iniciar:', err); process.exit(1); });
