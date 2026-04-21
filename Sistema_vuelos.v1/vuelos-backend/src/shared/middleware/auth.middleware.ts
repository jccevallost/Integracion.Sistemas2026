// src/shared/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Extender el tipo Request de Express para incluir `user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware de autenticación JWT.
 * Verifica el token en el header Authorization y puebla req.user.
 */
export function auth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Token no proporcionado' },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token expirado' },
      });
      return;
    }
    res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Token inválido' },
    });
  }
}

/**
 * Middleware de autorización por rol.
 * Debe usarse DESPUÉS de `auth`.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'NOT_AUTHENTICATED', message: 'No autenticado' },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'No tienes permisos para esta acción' },
      });
      return;
    }

    next();
  };
}

// Shortcut para rutas de solo admin
export const requireAdmin = requireRole('ADMIN');
