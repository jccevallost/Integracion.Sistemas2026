// presentation/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret, getJwtVerifyOptions } from '../security/jwt.config.js';
import { authServiceClient } from '../http-clients/AuthServiceClient.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

// auth-service sets AUTH_DATABASE_ACCESS=direct in docker-compose/env.
// Every other service uses HTTP to validate token liveness.
const USE_DB_DIRECT = process.env.AUTH_DATABASE_ACCESS === 'direct';

async function verifyTokenLiveness(userId: string, tokenVersion: number): Promise<boolean> {
  if (USE_DB_DIRECT) {
    // Dynamic import so non-auth services never load prisma.auth.client
    const { default: prisma } = await import('../database/prisma.auth.client.js');
    const db = prisma as any;
    const dbUser = await db.user.findUnique({
      where:  { id: userId },
      select: { isActive: true, tokenVersion: true },
    });
    return !!(dbUser && dbUser.isActive && dbUser.tokenVersion === tokenVersion);
  }

  const result = await authServiceClient.verifyToken(userId, tokenVersion);
  return result.valid;
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } });
    return;
  }

  try {
    const token   = header.slice(7);
    const payload = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions()) as any;

    const payloadVersion = payload.tokenVersion ?? 0;
    const valid = await verifyTokenLiveness(payload.id, payloadVersion);

    if (!valid) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' } });
      return;
    }

    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token inválido o expirado' } });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Autenticación requerida' } });
    return;
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado' } });
    return;
  }
  next();
}
