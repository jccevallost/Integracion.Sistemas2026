import type { RequestHandler } from 'express';

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const entry = {
      ts: new Date().toISOString(),
      component: 'api-gateway',
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      ms,
      cid: req.headers['x-correlation-id'],
    };

    if (res.statusCode >= 500)      console.error(JSON.stringify(entry));
    else if (res.statusCode >= 400) console.warn(JSON.stringify(entry));
    else                            console.log(JSON.stringify(entry));
  });

  next();
};
