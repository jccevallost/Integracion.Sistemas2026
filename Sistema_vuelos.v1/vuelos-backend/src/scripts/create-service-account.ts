/**
 * Script para crear una cuenta de servicio que el Booking Central usa
 * para autenticarse en el servidor gRPC.
 *
 * Uso:
 *   tsx src/scripts/create-service-account.ts
 *
 * El script imprime las credenciales. Guárdalas en el .env del Booking Central.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../shared/database/prisma.client.js';

const DB_CONNECT_MAX_ATTEMPTS = Number(process.env.DB_CONNECT_MAX_ATTEMPTS) || 5;
const DB_CONNECT_RETRY_MS = Number(process.env.DB_CONNECT_RETRY_MS) || 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectToDatabaseWithRetry() {
  let lastError: unknown;

  for (let attempt = 1; attempt <= DB_CONNECT_MAX_ATTEMPTS; attempt += 1) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      lastError = error;
      if (attempt === DB_CONNECT_MAX_ATTEMPTS) break;
      console.warn(`Conexion a PostgreSQL fallo en intento ${attempt}/${DB_CONNECT_MAX_ATTEMPTS}. Reintentando en ${DB_CONNECT_RETRY_MS}ms...`);
      await sleep(DB_CONNECT_RETRY_MS);
    }
  }

  throw lastError;
}

async function main() {
  await connectToDatabaseWithRetry();

  const email    = process.env.SERVICE_ACCOUNT_EMAIL    ?? 'booking-central@service.vuelos.com';
  const password = process.env.SERVICE_ACCOUNT_PASSWORD ?? `svc-${Math.random().toString(36).slice(2, 14)}`;

  const existing = await (prisma as any).user.findUnique({ where: { email } });
  if (existing) {
    console.log(`⚠️  La cuenta de servicio ya existe: ${email}`);
    console.log('   Si necesitas regenerar la contraseña, elimínala primero desde Prisma Studio.');
    await prisma.$disconnect();
    return;
  }

  // Necesitamos cityId válido — usamos el primero disponible
  const city = await (prisma as any).city.findFirst();
  if (!city) {
    console.error('❌ No hay ciudades en la base de datos. Ejecuta el seed primero.');
    await prisma.$disconnect();
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  const account = await (prisma as any).user.create({
    data: {
      email,
      passwordHash: hash,
      firstName:      'Booking',
      firstLastName:  'Central',
      mainAddress:    'Service Account',
      cityId:         city.id,
      role:           'SERVICE',
      isActive:       true,
    },
    select: { id: true, email: true, role: true },
  });

  console.log('\n✅ Cuenta de servicio creada\n');
  console.log('══════════════════════════════════════════════');
  console.log(`  Email    : ${account.email}`);
  console.log(`  Password : ${password}`);
  console.log(`  Role     : ${account.role}`);
  console.log(`  ID       : ${account.id}`);
  console.log('══════════════════════════════════════════════');
  console.log('\nFlujo de autenticación para el Booking Central:');
  console.log('  1. POST /api/v1/auth/login  { email, password }');
  console.log('  2. Guardar el token JWT recibido');
  console.log('  3. En cada llamada gRPC enviar metadata:');
  console.log('       authorization: "Bearer <token>"\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
