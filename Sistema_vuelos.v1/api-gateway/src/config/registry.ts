export interface ServiceConfig {
  name: string;
  url: string;
  pathPrefixes: string[];
}

const BASE = process.env.INTERNAL_BASE ?? 'http://localhost';

export const registry: ServiceConfig[] = [
  {
    name: 'auth-service',
    url: process.env.AUTH_SERVICE_URL ?? `${BASE}:3001`,
    pathPrefixes: ['/api/v1/auth', '/api/auth'],
  },
  {
    name: 'catalog-service',
    url: process.env.CATALOG_SERVICE_URL ?? `${BASE}:3002`,
    pathPrefixes: [
      '/api/v1/countries',
      '/api/v1/cities',
      '/api/v1/airports',
      '/api/v1/airlines',
      '/api/v1/aircraft',
      '/api/v1/airline-airports',
      '/api/v1/airline-service-config',
      '/api/v1/service-catalog',
    ],
  },
  {
    name: 'flights-service',
    url: process.env.FLIGHTS_SERVICE_URL ?? `${BASE}:3003`,
    pathPrefixes: [
      '/api/v1/flights',
      '/api/v1/flight-classes',
      '/api/v1/segments',
      '/api/v1/promotions',
      '/api/flights',
      '/api/promotions',
    ],
  },
  {
    name: 'booking-service',
    url: process.env.BOOKING_SERVICE_URL ?? `${BASE}:3004`,
    pathPrefixes: [
      '/api/v1/reservations',
      '/api/v1/reservation-passengers',
      '/api/v1/billing-profiles',
      '/api/v1/boarding-passes',
      '/api/reservations',
    ],
  },
  {
    name: 'payments-service',
    url: process.env.PAYMENTS_SERVICE_URL ?? `${BASE}:3005`,
    pathPrefixes: [
      '/api/v1/payments',
      '/api/v1/invoices',
      '/api/v1/invoice-items',
      '/api/v1/passenger-services',
    ],
  },
  {
    name: 'admin-service',
    url: process.env.ADMIN_SERVICE_URL ?? `${BASE}:3006`,
    pathPrefixes: [
      '/api/v1/admin',
      '/api/v1/audit-logs',
      '/api/admin',
    ],
  },
];
