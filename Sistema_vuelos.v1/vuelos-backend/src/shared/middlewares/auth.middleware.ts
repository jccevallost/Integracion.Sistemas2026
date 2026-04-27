// presentation/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJwtSecret, getJwtVerifyOptions } from '../security/jwt.config.js';
import prisma from '../database/prisma.client.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Token requerido' } });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions()) as any;

    const db = prisma as any;
    const dbUser = await db.user.findUnique({
      where: { id: payload.id },
      select: { isActive: true, tokenVersion: true },
    });

    const payloadVersion = payload.tokenVersion ?? 0;
    if (!dbUser || !dbUser.isActive || dbUser.tokenVersion !== payloadVersion) {
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
