import { randomUUID } from 'crypto';
import type { RequestHandler } from 'express';

export const correlationId: RequestHandler = (req, res, next) => {
  const cid = (req.headers['x-correlation-id'] as string) || randomUUID();
  req.headers['x-correlation-id'] = cid;
  res.setHeader('X-Correlation-Id', cid);
  next();
};
