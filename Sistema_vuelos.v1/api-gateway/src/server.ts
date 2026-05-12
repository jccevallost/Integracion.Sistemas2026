import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createYoga, createSchema } from 'graphql-yoga';
import { correlationId } from './middleware/correlationId.js';
import { requestLogger } from './middleware/logger.js';
import { globalRateLimiter, authRateLimiter, searchRateLimiter } from './middleware/rateLimiter.js';
import { createProxyRouter, getCircuitBreakerStatus } from './proxy/router.js';
import { registry } from './config/registry.js';
import { typeDefs } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { buildContext, type ServiceUrls } from './graphql/context.js';

const app  = express();
const PORT = Number(process.env.PORT) || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4200',
  process.env.FRONTEND_URL,
  'https://integracion-sistemas2026.onrender.com',
  'https://mango-meadow-0d3fdd810.7.azurestaticapps.net',
].filter(Boolean) as string[];

const services: ServiceUrls = {
  catalog:  process.env.CATALOG_SERVICE_URL  ?? 'http://localhost:3002',
  flights:  process.env.FLIGHTS_SERVICE_URL  ?? 'http://localhost:3003',
  booking:  process.env.BOOKING_SERVICE_URL  ?? 'http://localhost:3004',
  payments: process.env.PAYMENTS_SERVICE_URL ?? 'http://localhost:3005',
  admin:    process.env.ADMIN_SERVICE_URL    ?? 'http://localhost:3006',
};

// ── Seguridad ────────────────────────────────────────────────
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'no-referrer' },
}));

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    console.warn('[gateway] CORS bloqueado:', origin);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  exposedHeaders: ['X-Correlation-Id'],
  maxAge: 600,
}));

// ── Middleware pipeline ──────────────────────────────────────
app.use(correlationId);
app.use(globalRateLimiter);
app.use(requestLogger);

// Rate limits específicos
app.use(
  ['/api/v1/auth/login', '/api/v1/auth/register', '/api/auth/login', '/api/auth/register'],
  authRateLimiter,
);
app.use(['/api/v1/flights/search', '/api/flights/search'], searchRateLimiter);

// ── Health check del gateway ─────────────────────────────────
app.get(['/', '/health'], async (_req, res) => {
  const serviceChecks = await Promise.allSettled(
    registry.map(async (svc) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      try {
        const r = await fetch(`${svc.url}/health`, { signal: controller.signal });
        clearTimeout(timer);
        return { service: svc.name, status: r.ok ? 'up' : 'degraded', url: svc.url };
      } catch {
        clearTimeout(timer);
        return { service: svc.name, status: 'down', url: svc.url };
      }
    }),
  );

  const svcs = serviceChecks.map((c) =>
    c.status === 'fulfilled' ? c.value : { service: 'unknown', status: 'down' },
  );
  const allUp = svcs.every((s) => s.status === 'up');

  res.status(allUp ? 200 : 207).json({
    component: 'api-gateway',
    version: '2.0.0',
    status: allUp ? 'online' : 'degraded',
    services: svcs,
    circuitBreakers: getCircuitBreakerStatus(),
    ts: new Date().toISOString(),
  });
});

// ── GraphQL Aggregator (arquitectura híbrida REST + gRPC + GraphQL) ──
// Yoga sirve el IDE GraphiQL en GET /graphql (solo en desarrollo)
const yoga = createYoga({
  schema: createSchema({ typeDefs, resolvers }),
  graphqlEndpoint: '/graphql',
  graphiql: process.env.NODE_ENV !== 'production',
  maskedErrors: process.env.NODE_ENV === 'production',
  context: ({ request }: { request: Request }) => buildContext(request, services),
  logging: false, // el gateway ya tiene su propio logger
});

// Yoga implementa la interfaz estándar Node.js HTTP — compatible con Express 5
app.use('/graphql', yoga as unknown as express.RequestHandler);

// ── Proxy REST → microservicios ──────────────────────────────
app.use(createProxyRouter());

// ── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Ruta ${req.originalUrl} no encontrada en el gateway` },
  });
});

app.listen(PORT, () => {
  console.log(`\n🌐 API Gateway — http://localhost:${PORT}`);
  console.log(`   GraphQL IDE  → http://localhost:${PORT}/graphql`);
  console.log(`   Enrutando a ${registry.length} microservicios:\n`);
  for (const svc of registry) {
    console.log(`   [${svc.name.padEnd(20)}] → ${svc.url}`);
    for (const p of svc.pathPrefixes) {
      console.log(`      ${p}`);
    }
  }
  console.log('');
});
