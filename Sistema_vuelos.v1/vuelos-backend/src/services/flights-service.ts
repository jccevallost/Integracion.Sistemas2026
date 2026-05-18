import 'dotenv/config';
import { createServiceApp } from '../shared/app-factory.js';
import { errorHandler } from '../shared/middlewares/error.middleware.js';
import { validateJwtConfig } from '../shared/security/jwt.config.js';
import prisma from '../shared/database/prisma.flights.client.js';
import { startGrpcServer } from '../grpc/grpc.server.js';

import { FlightRepository }      from '../modules/api_flights/repositories/FlightRepository.js';
import { FlightClassRepository } from '../modules/api_flight_classes/repositories/FlightClassRepository.js';
import { SegmentRepository }     from '../modules/api_segments/repositories/SegmentRepository.js';
import { PromotionRepository }   from '../modules/api_promotions/repositories/PromotionRepository.js';

import {
  FlightQueryRepository,
  FlightClassQueryRepository,
  SegmentQueryRepository,
  PromotionQueryRepository,
} from '../shared/queries/index.js';

import { FlightService }      from '../modules/api_flights/services/FlightService.js';
import { FlightClassService } from '../modules/api_flight_classes/services/FlightClassService.js';
import { SegmentService }     from '../modules/api_segments/services/SegmentService.js';
import { PromotionService }   from '../modules/api_promotions/services/PromotionService.js';

import { FlightController }      from '../modules/api_flights/controllers/FlightController.js';
import { FlightClassController } from '../modules/api_flight_classes/controllers/FlightClassController.js';
import { SegmentController }     from '../modules/api_segments/controllers/SegmentController.js';
import { PromotionController }   from '../modules/api_promotions/controllers/PromotionController.js';

import { createFlightRouter }                                        from '../modules/api_flights/routes/flights.routes.js';
import { createFlightClassRouter, createFlightClassInternalRouter } from '../modules/api_flight_classes/routes/flight-classes.routes.js';
import { createSegmentRouter }                                       from '../modules/api_segments/routes/segments.routes.js';
import { createPromotionRouter, createPromotionInternalRouter }     from '../modules/api_promotions/routes/promotions.routes.js';

const PORT      = Number(process.env.FLIGHTS_SERVICE_PORT) || 3003;
const GRPC_PORT = Number(process.env.GRPC_PORT) || 50051;

validateJwtConfig();

// Repositories
const flightRepo      = new FlightRepository(prisma);
const flightClassRepo = new FlightClassRepository(prisma);
const segmentRepo     = new SegmentRepository(prisma);
const promotionRepo   = new PromotionRepository(prisma);

// Query repos
const flightQuery      = new FlightQueryRepository(prisma);
const flightClassQuery = new FlightClassQueryRepository(prisma);
const segmentQuery     = new SegmentQueryRepository(prisma);
const promotionQuery   = new PromotionQueryRepository(prisma);

// Services (exported para que el servidor gRPC los use)
export const flightService      = new FlightService(flightRepo);
export const flightClassService = new FlightClassService(flightClassRepo);
export const promotionService   = new PromotionService(promotionRepo);

const segmentService   = new SegmentService(segmentRepo);

// Controllers
const flightController      = new FlightController(flightService);
const flightClassController = new FlightClassController(flightClassService);
const segmentController     = new SegmentController(segmentService);
const promotionController   = new PromotionController(promotionService);

const app = createServiceApp('flights-service');

app.get(['/health', '/'], (_req, res) => {
  res.json({
    service: 'flights-service',
    status: 'online',
    port: PORT,
    grpcPort: GRPC_PORT,
    version: '2.0.0',
    resources: ['flights', 'flight-classes', 'segments', 'promotions'],
  });
});

app.use('/api/v1/flights',        createFlightRouter(flightController));
app.use('/api/v1/flight-classes', createFlightClassRouter(flightClassController));
app.use('/api/v1/segments',       createSegmentRouter(segmentController));
app.use('/api/v1/promotions',     createPromotionRouter(promotionController));
app.use('/api/flights',           createFlightRouter(flightController));
app.use('/api/promotions',        createPromotionRouter(promotionController));

// Rutas internas — solo accesibles con x-internal-api-key (servicio a servicio)
app.use('/internal/flight-classes', createFlightClassInternalRouter(flightClassService));
app.use('/internal/promotions',     createPromotionInternalRouter(promotionService));

app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Ruta ${req.originalUrl} no encontrada` } });
});
app.use(errorHandler);

async function start() {
  await prisma.$connect();
  await startGrpcServer(GRPC_PORT);
  app.listen(PORT, () => {
    console.log(`🚀 [flights-service] REST → http://localhost:${PORT}`);
    console.log(`📡 [flights-service] gRPC → localhost:${GRPC_PORT}`);
  });
}

process.on('SIGINT',  async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('uncaughtException',  (err) => { console.error('[flights-service] Excepción:', err); process.exit(1); });
process.on('unhandledRejection', (r)   => { console.error('[flights-service] Promesa rechazada:', r); process.exit(1); });

start().catch((err) => { console.error('[flights-service] Error al iniciar:', err); process.exit(1); });
