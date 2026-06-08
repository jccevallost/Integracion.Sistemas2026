import 'dotenv/config';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import prismaAdmin from '../shared/database/prisma.admin.client.js';
import prismaAuth from '../shared/database/prisma.auth.client.js';
import prismaBooking from '../shared/database/prisma.booking.client.js';
import prismaCatalog from '../shared/database/prisma.catalog.client.js';
import prismaFlights from '../shared/database/prisma.flights.client.js';
import prismaPayments from '../shared/database/prisma.payments.client.js';

type MetricStatus = 'ok' | 'error';

type Metric<T = unknown> = {
  status: MetricStatus;
  value?: T;
  error?: string;
};

type Report = {
  generatedAt: string;
  pipeline: {
    name: string;
    mode: 'ETL';
    extract: string[];
    transform: string[];
    load: string[];
  };
  domains: Record<string, Record<string, Metric>>;
  kpis: Record<string, Metric>;
  dataQuality: string[];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '../..');
const repoRoot = path.resolve(backendRoot, '..');
const outputPath = path.resolve(
  repoRoot,
  process.env.RETO3_REPORT_PATH ?? 'docs/evidence/reto3-operational-report.json',
);

async function metric<T>(run: () => Promise<T>): Promise<Metric<T>> {
  try {
    return { status: 'ok', value: await run() };
  } catch (err) {
    return {
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function countByStatus(db: any, model: string, field = 'status') {
  return db[model].groupBy({ by: [field], _count: { id: true } });
}

function numberValue(metricValue: Metric): number | undefined {
  return typeof metricValue.value === 'number' ? metricValue.value : undefined;
}

async function buildReport(): Promise<Report> {
  const domains = {
    identity: {
      users: await metric(() => prismaAuth.user.count()),
      activeUsers: await metric(() => prismaAuth.user.count({ where: { isActive: true } })),
      admins: await metric(() => prismaAuth.user.count({ where: { role: 'ADMIN' } })),
      customers: await metric(() => prismaAuth.user.count({ where: { role: 'CUSTOMER' } })),
    },
    catalog: {
      countries: await metric(() => prismaCatalog.country.count()),
      cities: await metric(() => prismaCatalog.city.count()),
      airports: await metric(() => prismaCatalog.airport.count()),
      airlines: await metric(() => prismaCatalog.airline.count()),
      aircraft: await metric(() => prismaCatalog.aircraft.count()),
      serviceCatalogItems: await metric(() => prismaCatalog.serviceCatalog.count()),
      airlineServiceConfigs: await metric(() => prismaCatalog.airlineServiceConfig.count()),
    },
    flights: {
      flights: await metric(() => prismaFlights.flight.count()),
      flightClasses: await metric(() => prismaFlights.flightClass.count()),
      segments: await metric(() => prismaFlights.segment.count()),
      promotions: await metric(() => prismaFlights.promotion.count()),
      activePromotions: await metric(() =>
        prismaFlights.promotion.count({ where: { isActive: true } }),
      ),
    },
    booking: {
      reservations: await metric(() => prismaBooking.reservation.count()),
      reservationsByStatus: await metric(() => countByStatus(prismaBooking, 'reservation')),
      passengers: await metric(() => prismaBooking.reservationPassenger.count()),
      passengerServices: await metric(() => prismaBooking.passengerService.count()),
      boardingPasses: await metric(() => prismaBooking.boardingPass.count()),
      boardingPassesByStatus: await metric(() => countByStatus(prismaBooking, 'boardingPass')),
    },
    payments: {
      payments: await metric(() => prismaPayments.payment.count()),
      paymentsByStatus: await metric(() => countByStatus(prismaPayments, 'payment')),
      totalRevenue: await metric(async () => {
        const result = await prismaPayments.payment.aggregate({ _sum: { amount: true } });
        return Number(result._sum.amount ?? 0);
      }),
      invoices: await metric(() => prismaPayments.invoice.count()),
      invoicedTotal: await metric(async () => {
        const result = await prismaPayments.invoice.aggregate({ _sum: { total: true } });
        return Number(result._sum.total ?? 0);
      }),
      billingProfiles: await metric(() => prismaPayments.billingProfile.count()),
    },
    audit: {
      auditLogs: await metric(() => prismaAdmin.auditLog.count()),
      latestAuditLogs: await metric(() =>
        prismaAdmin.auditLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            action: true,
            entity: true,
            entityId: true,
            createdAt: true,
          },
        }),
      ),
    },
  };

  const reservations = numberValue(domains.booking.reservations);
  const payments = numberValue(domains.payments.payments);
  const passengers = numberValue(domains.booking.passengers);
  const revenue = numberValue(domains.payments.totalRevenue);

  const kpis: Report['kpis'] = {
    paidReservationRatio: {
      status: reservations === undefined || payments === undefined ? 'error' : 'ok',
      value: reservations ? Number((payments / reservations).toFixed(4)) : 0,
      ...(reservations === undefined || payments === undefined
        ? { error: 'No se pudieron extraer reservas o pagos' }
        : {}),
    },
    averageRevenuePerPassenger: {
      status: passengers === undefined || revenue === undefined ? 'error' : 'ok',
      value: passengers ? Number((revenue / passengers).toFixed(2)) : 0,
      ...(passengers === undefined || revenue === undefined
        ? { error: 'No se pudieron extraer pasajeros o ingresos' }
        : {}),
    },
  };

  const dataQuality = [
    reservations === 0 ? 'No hay reservas para analizar.' : '',
    payments !== undefined && reservations !== undefined && payments > reservations
      ? 'Hay mas pagos que reservas; revisar duplicados o pagos de reservas externas.'
      : '',
    passengers !== undefined && reservations !== undefined && reservations > 0 && passengers === 0
      ? 'Hay reservas sin pasajeros; revisar integridad de booking.'
      : '',
  ].filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    pipeline: {
      name: 'reto3-operational-report',
      mode: 'ETL',
      extract: ['identity', 'catalog', 'flights', 'booking', 'payments', 'audit'],
      transform: [
        'Conteos por dominio',
        'Agrupaciones por estado',
        'KPIs de conversion e ingreso promedio',
        'Reglas basicas de calidad de datos',
      ],
      load: ['docs/evidence/reto3-operational-report.json'],
    },
    domains,
    kpis,
    dataQuality,
  };
}

async function main() {
  const report = await buildReport();
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
  console.log(`Reto 3 ETL report written: ${outputPath}`);
}

process.on('SIGINT', async () => {
  await Promise.allSettled([
    prismaAdmin.$disconnect(),
    prismaAuth.$disconnect(),
    prismaBooking.$disconnect(),
    prismaCatalog.$disconnect(),
    prismaFlights.$disconnect(),
    prismaPayments.$disconnect(),
  ]);
  process.exit(0);
});

main()
  .finally(() =>
    Promise.allSettled([
      prismaAdmin.$disconnect(),
      prismaAuth.$disconnect(),
      prismaBooking.$disconnect(),
      prismaCatalog.$disconnect(),
      prismaFlights.$disconnect(),
      prismaPayments.$disconnect(),
    ]),
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
