// infrastructure/database/prisma.client.ts
import { PrismaClient } from '@prisma/client';

// Singleton — una sola conexión en toda la aplicación
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
