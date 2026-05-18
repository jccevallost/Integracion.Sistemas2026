import { createRequire } from 'module';
import type { PrismaClient as PrismaClientPublic } from '@prisma/client';

const _require = createRequire(import.meta.url);
const { PrismaClient } = _require('../../../prisma-clients/auth/index.js') as {
  PrismaClient: new (opts?: ConstructorParameters<typeof PrismaClientPublic>[0]) => PrismaClientPublic;
};

const prismaAuth = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prismaAuth;
