export interface TokenVerifyResult {
  valid: boolean;
}

export class AuthServiceClient {
  private readonly baseUrl: string;
  private readonly internalKey: string;

  constructor() {
    this.baseUrl     = (process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
    this.internalKey = process.env.INTERNAL_API_KEY ?? '';
  }

  async verifyToken(userId: string, tokenVersion: number): Promise<TokenVerifyResult> {
    const res = await fetch(`${this.baseUrl}/internal/auth/verify-token`, {
      method:  'POST',
      headers: {
        'Content-Type':       'application/json',
        'x-internal-api-key': this.internalKey,
      },
      body: JSON.stringify({ userId, tokenVersion }),
    });

    if (!res.ok) return { valid: false };
    return res.json() as Promise<TokenVerifyResult>;
  }
}

export const authServiceClient = new AuthServiceClient();
