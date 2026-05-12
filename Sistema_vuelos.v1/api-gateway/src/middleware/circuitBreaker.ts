import type { RequestHandler } from 'express';

interface CircuitBreakerOptions {
  threshold: number;    // fallos para abrir el circuito
  resetTimeout: number; // ms antes de pasar a HALF_OPEN
}

type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: State = 'CLOSED';
  private failures = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly serviceName: string,
    private readonly options: CircuitBreakerOptions,
  ) {}

  recordFailure(): void {
    this.failures += 1;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.options.threshold) {
      if (this.state !== 'OPEN') {
        this.state = 'OPEN';
        console.warn(`[circuit-breaker] ${this.serviceName} → OPEN (${this.failures} fallos consecutivos)`);
      }
    }
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = 0;
      console.info(`[circuit-breaker] ${this.serviceName} → CLOSED (recuperado)`);
    } else if (this.state === 'CLOSED' && this.failures > 0) {
      this.failures = 0;
    }
  }

  private tryHalfOpen(): boolean {
    if (this.state === 'OPEN' && Date.now() - this.lastFailureTime > this.options.resetTimeout) {
      this.state = 'HALF_OPEN';
      console.info(`[circuit-breaker] ${this.serviceName} → HALF_OPEN (probando recuperación)`);
      return true;
    }
    return false;
  }

  middleware(): RequestHandler {
    return (_req, res, next) => {
      if (this.state === 'CLOSED' || this.state === 'HALF_OPEN') return next();
      if (this.tryHalfOpen()) return next();

      const retryAfter = Math.ceil(
        (this.options.resetTimeout - (Date.now() - this.lastFailureTime)) / 1000,
      );
      res.status(503)
        .setHeader('Retry-After', String(Math.max(retryAfter, 1)))
        .json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `Servicio ${this.serviceName} temporalmente no disponible. Reintenta en ${Math.max(retryAfter, 1)}s`,
          },
        });
    };
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime || null,
    };
  }
}
