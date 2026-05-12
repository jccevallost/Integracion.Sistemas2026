import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { registry } from '../config/registry.js';
import { CircuitBreaker } from '../middleware/circuitBreaker.js';

const breakers = new Map<string, CircuitBreaker>();

export function createProxyRouter(): Router {
  const router = Router();

  for (const svc of registry) {
    const breaker = new CircuitBreaker(svc.name, {
      threshold: 5,
      resetTimeout: 30_000,
    });
    breakers.set(svc.name, breaker);

    const proxy = createProxyMiddleware<any, any>({
      target: svc.url,
      changeOrigin: true,
      on: {
        error: (err: Error, _req: any, res: any) => {
          breaker.recordFailure();
          console.error(`[gateway] Error proxying to ${svc.name}: ${err.message}`);
          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              error: {
                code: 'BAD_GATEWAY',
                message: `Servicio ${svc.name} no disponible temporalmente`,
              },
            });
          }
        },
        proxyRes: () => {
          breaker.recordSuccess();
        },
      },
    });

    for (const prefix of svc.pathPrefixes) {
      router.use(prefix, breaker.middleware(), proxy);
    }
  }

  return router;
}

export function getCircuitBreakerStatus() {
  const status: Record<string, object> = {};
  for (const [name, breaker] of breakers) {
    status[name] = breaker.getStatus();
  }
  return status;
}
