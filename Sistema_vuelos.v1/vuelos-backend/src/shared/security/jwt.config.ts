import type { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';

export const JWT_ALGORITHM: Algorithm = 'HS256';
export const JWT_ISSUER = process.env.JWT_ISSUER ?? 'vuelos-api';
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? 'vuelos-client';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no configurado');
  return secret;
}

export function validateJwtConfig(): void {
  const secret = getJwtSecret();
  if (process.env.NODE_ENV === 'production' && secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres en produccion');
  }
}

export function getJwtSignOptions(expiresIn: string): SignOptions {
  return {
    algorithm: JWT_ALGORITHM,
    expiresIn: expiresIn as any,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  };
}

export function getJwtVerifyOptions(): VerifyOptions {
  return {
    algorithms: [JWT_ALGORITHM],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  };
}
