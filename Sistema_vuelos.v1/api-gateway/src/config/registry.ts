export interface ServiceConfig {
  name: string;
  url: string;
  pathPrefixes: string[];
}

const BASE = process.env.INTERNAL_BASE ?? 'http://localhost';

function serviceUrl(value: string | undefined, fallback: string): string {
  const raw = value ?? fallback;
  return /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
}

function publicPrefixes(prefixes: string[]): string[] {
  const v2Prefixes = prefixes
    .filter((prefix) => prefix.startsWith('/api/v1/'))
    .map((prefix) => prefix.replace('/api/v1/', '/api/v2/'));

  return [...prefixes, ...v2Prefixes];
}

export const registry: ServiceConfig[] = [
  {
    name: 'auth-service',
    url: serviceUrl(process.env.AUTH_SERVICE_URL, `${BASE}:3001`),
    pathPrefixes: publicPrefixes(['/api/v1/auth', '/api/auth']),
  },
  {
    name: 'catalog-service',
    url: serviceUrl(process.env.CATALOG_SERVICE_URL, `${BASE}:3002`),
    pathPrefixes: publicPrefixes([
      '/api/v1/countries',
      '/api/v1/cities',
      '/api/v1/airports',
      '/api/v1/airlines',
      '/api/v1/aircraft',
      '/api/v1/airline-airports',
      '/api/v1/airline-service-config',
      '/api/v1/service-catalog',
    ]),
  },
  {
    name: 'flights-service',
    url: serviceUrl(process.env.FLIGHTS_SERVICE_URL, `${BASE}:3003`),
    pathPrefixes: publicPrefixes([
      '/api/v1/flights',
      '/api/v1/flight-classes',
      '/api/v1/segments',
      '/api/v1/promotions',
      '/api/flights',
      '/api/promotions',
    ]),
  },
  {
    name: 'booking-service',
    url: serviceUrl(process.env.BOOKING_SERVICE_URL, `${BASE}:3004`),
    pathPrefixes: publicPrefixes([
      '/api/v1/reservations',
      '/api/v1/reservas',
      '/api/v1/reservation-passengers',
      '/api/v1/billing-profiles',
      '/api/v1/boarding-passes',
      '/api/reservations',
    ]),
  },
  {
    name: 'payments-service',
    url: serviceUrl(process.env.PAYMENTS_SERVICE_URL, `${BASE}:3005`),
    pathPrefixes: publicPrefixes([
      '/api/v1/payments',
      '/api/v1/invoices',
      '/api/v1/invoice-items',
      '/api/v1/passenger-services',
    ]),
  },
  {
    name: 'admin-service',
    url: serviceUrl(process.env.ADMIN_SERVICE_URL, `${BASE}:3006`),
    pathPrefixes: publicPrefixes([
      '/api/v1/admin',
      '/api/v1/audit-logs',
      '/api/admin',
    ]),
  },
];
