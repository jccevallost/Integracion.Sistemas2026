// src/server.ts — punto de entrada de la aplicación
import 'dotenv/config';
import { randomUUID } from 'crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/swagger.js';

// ── Dependency Injection Container ──────────────────────────
import {
  authController,
  flightController,
  reservationController,
  promotionController,
  adminController,
  countryController,
  cityController,
  airportController,
  airlineController,
  aircraftController,
  airlineAirportController,
  airlineServiceConfigController,
  flightClassController,
  segmentController,
  serviceCatalogController,
  billingProfileController,
  boardingPassController,
  paymentController,
  invoiceController,
  invoiceItemController,
  passengerServiceController,
  reservationPassengerController,
  auditLogController,
  prisma,
} from './shared/container.js';

// ── Routers ──────────────────────────────────────────────────
import { createAuthRouter }                  from './modules/api_users/routes/auth.routes.js';
import { createFlightRouter }                from './modules/api_flights/routes/flights.routes.js';
import { createReservationRouter }           from './modules/api_reservations/routes/reservations.routes.js';
import { createPromotionRouter }             from './modules/api_promotions/routes/promotions.routes.js';
import { createAdminRouter }                 from './modules/api_admin/routes/admin.routes.js';
import { createCountryRouter }               from './modules/api_countries/routes/countries.routes.js';
import { createCityRouter }                  from './modules/api_cities/routes/cities.routes.js';
import { createAirportRouter }               from './modules/api_airports/routes/airports.routes.js';
import { createAirlineRouter }               from './modules/api_airlines/routes/airlines.routes.js';
import { createAircraftRouter }              from './modules/api_aircrafts/routes/aircraft.routes.js';
import { createAirlineAirportRouter }        from './modules/api_airline_airports/routes/airline-airports.routes.js';
import { createAirlineServiceConfigRouter }  from './modules/api_airline_service_configs/routes/airline-service-config.routes.js';
import { createFlightClassRouter }           from './modules/api_flight_classes/routes/flight-classes.routes.js';
import { createSegmentRouter }               from './modules/api_segments/routes/segments.routes.js';
import { createServiceCatalogRouter }        from './modules/api_service_catalog/routes/service-catalog.routes.js';
import { createBillingProfileRouter }        from './modules/api_billing_profiles/routes/billing-profiles.routes.js';
import { createBoardingPassRouter }          from './modules/api_boarding_passes/routes/boarding-passes.routes.js';
import { createPaymentRouter }               from './modules/api_payments/routes/payments.routes.js';
import { createInvoiceRouter }               from './modules/api_invoices/routes/invoices.routes.js';
import { createInvoiceItemRouter }           from './modules/api_invoice_items/routes/invoice-items.routes.js';
import { createPassengerServiceRouter }      from './modules/api_passenger_services/routes/passenger-services.routes.js';
import { createReservationPassengerRouter }  from './modules/api_reservation_passengers/routes/reservation-passengers.routes.js';
import { createAuditLogRouter }              from './modules/api_audit_logs/routes/audit-logs.routes.js';
import { errorHandler }                      from './shared/middlewares/error.middleware.js';
import { validateJwtConfig }                 from './shared/security/jwt.config.js';

// ============================================================
//                        APP SETUP
// ============================================================

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

validateJwtConfig();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
}));

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4200',
  'https://integracion-sistemas2026.onrender.com',
  'https://mango-meadow-0d3fdd810.7.azurestaticapps.net',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    console.warn('⚠️  CORS bloqueado:', origin);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  maxAge: 600,
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 450,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.' } },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Demasiados intentos de autenticacion. Intenta mas tarde.' } },
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 90,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Demasiadas busquedas. Intenta nuevamente en unos segundos.' } },
});

app.use('/api', apiLimiter);
app.use(['/api/v1/auth/login', '/api/auth/login', '/api/v1/auth/register', '/api/auth/register'], authLimiter);
app.use(['/api/v1/flights/search', '/api/flights/search'], searchLimiter);

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && Number(req.headers['content-length'] ?? 0) > 0 && !req.is('application/json')) {
    res.status(415).json({ success: false, error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type debe ser application/json' } });
    return;
  }
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Correlation ID ───────────────────────────────────────────
app.use((req, res, next) => {
  const cid = (req.headers['x-correlation-id'] as string) || randomUUID();
  req.headers['x-correlation-id'] = cid;
  res.setHeader('X-Correlation-Id', cid);
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
  }
  next();
});

// ── Logger estructurado ──────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), method: req.method, path: req.path, cid: req.headers['x-correlation-id'] }));
    next();
  });
}

// ============================================================
//                        HEALTH CHECK
// ============================================================

app.get(['/', '/api/v1'], (_req, res) => {
  res.json({
    service: 'Vuelos API',
    version: '1.0.0',
    status: 'online',
    architecture: 'Clean Architecture (Domain / Application / Infrastructure / Presentation)',
    tables: 22,
    endpoints: {
      auth:                  '/api/v1/auth',
      flights:               '/api/v1/flights',
      reservations:          '/api/v1/reservations',
      promotions:            '/api/v1/promotions',
      countries:             '/api/v1/countries',
      cities:                '/api/v1/cities',
      airports:              '/api/v1/airports',
      airlines:              '/api/v1/airlines',
      aircraft:              '/api/v1/aircraft',
      airlineAirports:       '/api/v1/airline-airports',
      airlineServiceConfig:  '/api/v1/airline-service-config',
      flightClasses:         '/api/v1/flight-classes',
      segments:              '/api/v1/segments',
      serviceCatalog:        '/api/v1/service-catalog',
      billingProfiles:       '/api/v1/billing-profiles',
      boardingPasses:        '/api/v1/boarding-passes',
      payments:              '/api/v1/payments',
      invoices:              '/api/v1/invoices',
      invoiceItems:          '/api/v1/invoice-items',
      passengerServices:     '/api/v1/passenger-services',
      reservationPassengers: '/api/v1/reservation-passengers',
      auditLogs:             '/api/v1/audit-logs',
      admin:                 '/api/v1/admin',
    },
  });
});

// ============================================================
//   RUTAS v1
// ============================================================

// Auth & Users
app.use('/api/v1/auth',         createAuthRouter(authController));
app.use('/api/v1/reservations', createReservationRouter(reservationController, prisma));
app.use('/api/v1/promotions',   createPromotionRouter(promotionController));

// Catálogos geográficos (GET público, mutaciones admin)
app.use('/api/v1/countries', createCountryRouter(countryController));
app.use('/api/v1/cities',    createCityRouter(cityController));
app.use('/api/v1/airports',  createAirportRouter(airportController));

// Aerolíneas y aeronaves (GET público, mutaciones admin)
app.use('/api/v1/airlines',              createAirlineRouter(airlineController));
app.use('/api/v1/aircraft',              createAircraftRouter(aircraftController));
app.use('/api/v1/airline-airports',      createAirlineAirportRouter(airlineAirportController));
app.use('/api/v1/airline-service-config',createAirlineServiceConfigRouter(airlineServiceConfigController));

// Vuelos y clases (GET público, mutaciones admin)
app.use('/api/v1/flights',       createFlightRouter(flightController));
app.use('/api/v1/flight-classes',createFlightClassRouter(flightClassController));
app.use('/api/v1/segments',      createSegmentRouter(segmentController));

// Servicios de catálogo (GET público, mutaciones admin)
app.use('/api/v1/service-catalog', createServiceCatalogRouter(serviceCatalogController));

// Operaciones autenticadas
app.use('/api/v1/billing-profiles',       createBillingProfileRouter(billingProfileController, prisma));
app.use('/api/v1/boarding-passes',        createBoardingPassRouter(boardingPassController, prisma));
app.use('/api/v1/payments',               createPaymentRouter(paymentController, prisma));
app.use('/api/v1/invoices',               createInvoiceRouter(invoiceController, prisma));
app.use('/api/v1/invoice-items',          createInvoiceItemRouter(invoiceItemController, prisma));
app.use('/api/v1/passenger-services',     createPassengerServiceRouter(passengerServiceController, prisma));
app.use('/api/v1/reservation-passengers', createReservationPassengerRouter(reservationPassengerController, prisma));
app.use('/api/v1/audit-logs',             createAuditLogRouter(auditLogController));

// Admin panel (todas requieren ADMIN)
app.use('/api/v1/admin', createAdminRouter(adminController, prisma));

// ── Alias sin versión (backward compatibility) ───────────────
app.use('/api/auth',                  createAuthRouter(authController));
app.use('/api/flights',               createFlightRouter(flightController));
app.use('/api/reservations',          createReservationRouter(reservationController, prisma));
app.use('/api/promotions',            createPromotionRouter(promotionController));
app.use('/api/admin',                 createAdminRouter(adminController, prisma));

// ── Documentación Swagger UI ─────────────────────────────────
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Vuelos API — Docs',
  swaggerOptions: { persistAuthorization: true },
}));
app.get('/api/v1/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.get('/api/v1/spec', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Ruta ${req.originalUrl} no encontrada` } });
});

app.use(errorHandler);

// ============================================================
//                        ARRANQUE
// ============================================================

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');

    app.listen(PORT, () => {
      console.log(`\n🚀 Vuelos API — http://localhost:${PORT}`);
      console.log(`\n📡 Endpoints activos (${22} tablas cubiertas):`);
      console.log(`   /api/v1/auth                   — autenticación`);
      console.log(`   /api/v1/countries              — países (GET público)`);
      console.log(`   /api/v1/cities                 — ciudades (GET público)`);
      console.log(`   /api/v1/airports               — aeropuertos (GET público)`);
      console.log(`   /api/v1/airlines               — aerolíneas (GET público)`);
      console.log(`   /api/v1/aircraft               — aeronaves (GET público)`);
      console.log(`   /api/v1/airline-airports        — relación aerolínea-aeropuerto`);
      console.log(`   /api/v1/airline-service-config  — configuración de servicios`);
      console.log(`   /api/v1/flights                — vuelos (GET público)`);
      console.log(`   /api/v1/flight-classes         — clases de vuelo`);
      console.log(`   /api/v1/segments               — segmentos`);
      console.log(`   /api/v1/service-catalog        — catálogo de servicios`);
      console.log(`   /api/v1/promotions             — promociones`);
      console.log(`   /api/v1/reservations           — reservas (auth)`);
      console.log(`   /api/v1/reservation-passengers — pasajeros (auth)`);
      console.log(`   /api/v1/billing-profiles       — perfiles de facturación (auth)`);
      console.log(`   /api/v1/payments               — pagos (auth)`);
      console.log(`   /api/v1/invoices               — facturas (auth)`);
      console.log(`   /api/v1/invoice-items          — ítems de factura (auth)`);
      console.log(`   /api/v1/passenger-services     — servicios de pasajero (auth)`);
      console.log(`   /api/v1/boarding-passes        — pases de abordar (auth)`);
      console.log(`   /api/v1/audit-logs             — auditoría (admin)`);
      console.log(`   /api/v1/admin                  — panel admin (admin)`);
      console.log(`\n💡 Modo: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

process.on('SIGINT',  async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('uncaughtException',   (err) => { console.error('❌ Excepción no capturada:', err); process.exit(1); });
process.on('unhandledRejection',  (r)   => { console.error('❌ Promesa rechazada:', r); process.exit(1); });

startServer();
