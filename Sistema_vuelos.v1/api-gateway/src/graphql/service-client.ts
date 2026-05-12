// HTTP client interno para llamadas entre el gateway y los microservicios.
// Propaga el JWT del usuario y desenvuelve el wrapper { success, data }.
export class ServiceClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string,
  ) {}

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      const msg = (body?.error as Record<string, unknown>)?.message ?? `HTTP ${res.status}`;
      throw new Error(String(msg));
    }
    const body = await res.json() as { success: boolean; data: T };
    return body.data;
  }

  async post<T>(path: string, payload: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      const msg = (body?.error as Record<string, unknown>)?.message ?? `HTTP ${res.status}`;
      throw new Error(String(msg));
    }
    const body = await res.json() as { success: boolean; data: T };
    return body.data;
  }

  async patch<T>(path: string, payload: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      const msg = (body?.error as Record<string, unknown>)?.message ?? `HTTP ${res.status}`;
      throw new Error(String(msg));
    }
    const body = await res.json() as { success: boolean; data: T };
    return body.data;
  }
}
