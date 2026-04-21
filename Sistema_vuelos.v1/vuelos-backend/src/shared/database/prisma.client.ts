// infrastructure/database/prisma.client.ts
// @prisma/client is CJS; use createRequire for ESM/CJS interop on Node.js 20 Linux
import { createRequire } from 'module';
import type { PrismaClient as PrismaClientType } from '@prisma/client';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('@prisma/client') as { PrismaClient: typeof PrismaClientType };

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
