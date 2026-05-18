import { Request, Response, NextFunction } from 'express';

export function requireInternalService(req: Request, res: Response, next: NextFunction): void {
  const key      = req.headers['x-internal-api-key'];
  const expected = process.env.INTERNAL_API_KEY;

  if (!expected) {
    res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: 'INTERNAL_API_KEY no configurado' } });
    return;
  }
  if (!key || key !== expected) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso interno denegado' } });
    return;
  }
  next();
}
