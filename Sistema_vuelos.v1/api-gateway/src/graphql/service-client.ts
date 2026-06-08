// HTTP client interno para llamadas entre el gateway y los microservicios.
// Propaga el JWT del usuario y desenvuelve el wrapper { success, data }.
export class ServiceClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string,
    private readonly correlationId?: string,
    private readonly timeoutMs: number = 5000,
  ) {}

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...(this.correlationId ? { 'x-correlation-id': this.correlationId } : {}),
    };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.headers(), ...(init.headers ?? {}) },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      const msg = (body?.error as Record<string, unknown>)?.message ?? `HTTP ${res.status}`;
      throw new Error(String(msg));
    }
    const body = await res.json() as { success: boolean; data: T };
    return body.data;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  async post<T>(path: string, payload: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async patch<T>(path: string, payload: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }
}
