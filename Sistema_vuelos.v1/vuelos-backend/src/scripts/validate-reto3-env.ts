import 'dotenv/config';

type EnvRule = {
  key: string;
  description: string;
  requiredFor: string[];
  secret?: boolean;
};

const rules: EnvRule[] = [
  {
    key: 'JWT_SECRET',
    description: 'Clave de firma JWT fuerte.',
    requiredFor: ['auth-service', 'booking-service', 'payments-service', 'admin-service', 'api-gateway'],
    secret: true,
  },
  {
    key: 'INTERNAL_API_KEY',
    description: 'Clave para llamadas internas entre servicios.',
    requiredFor: ['booking-service', 'flights-service', 'auth-service'],
    secret: true,
  },
  {
    key: 'AUTH_DATABASE_URL',
    description: 'Conexion del dominio identity.',
    requiredFor: ['auth-service', 'admin-service', 'payments-service'],
    secret: true,
  },
  {
    key: 'CATALOG_DATABASE_URL',
    description: 'Conexion del dominio catalog.',
    requiredFor: ['catalog-service', 'auth-service', 'payments-service', 'admin-service'],
    secret: true,
  },
  {
    key: 'FLIGHTS_DATABASE_URL',
    description: 'Conexion del dominio flights/catalog read model.',
    requiredFor: ['flights-service', 'admin-service'],
    secret: true,
  },
  {
    key: 'BOOKING_DATABASE_URL',
    description: 'Conexion del dominio booking/checkin.',
    requiredFor: ['booking-service', 'payments-service', 'admin-service'],
    secret: true,
  },
  {
    key: 'PAYMENTS_DATABASE_URL',
    description: 'Conexion del dominio payments.',
    requiredFor: ['payments-service', 'admin-service'],
    secret: true,
  },
  {
    key: 'ADMIN_DATABASE_URL',
    description: 'Conexion del dominio audit.',
    requiredFor: ['admin-service'],
    secret: true,
  },
  {
    key: 'RABBITMQ_URL',
    description: 'Broker RabbitMQ o CloudAMQP.',
    requiredFor: ['booking-service', 'payments-service', 'admin-service'],
    secret: true,
  },
  {
    key: 'FRONTEND_URL',
    description: 'Origen permitido para CORS del frontend web/movil.',
    requiredFor: ['api-gateway'],
  },
];

function isMissing(value: string | undefined): boolean {
  if (!value) return true;
  return /^(change-me|your-|postgresql:\/\/USER|https:\/\/tu-frontend)/i.test(value);
}

const rows = rules.map((rule) => ({
  ...rule,
  present: !isMissing(process.env[rule.key]),
}));

const missing = rows.filter((row) => !row.present);

console.log('Reto 3 environment validation');
console.log('=============================');
for (const row of rows) {
  console.log(`${row.present ? 'OK ' : 'MISS'} ${row.key} - ${row.description}`);
  console.log(`     requerido por: ${row.requiredFor.join(', ')}`);
}

if (missing.length) {
  console.error('\nVariables faltantes para una demo/despliegue v2 completo:');
  for (const row of missing) {
    console.error(`- ${row.key}`);
  }
  process.exit(1);
}

console.log('\nTodas las variables criticas de Reto 3 estan configuradas.');
