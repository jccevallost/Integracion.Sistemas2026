import { createLoaders, type Loaders } from './dataloaders.js';

export interface ServiceUrls {
  catalog:  string;
  flights:  string;
  booking:  string;
  payments: string;
  admin:    string;
}

export interface GraphQLContext {
  token?:   string;
  userId?:  string;
  services: ServiceUrls;
  loaders:  Loaders;
}

function decodeUserId(token: string): string | undefined {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as Record<string, unknown>;
    return String(decoded.sub ?? decoded.userId ?? decoded.id ?? '');
  } catch {
    return undefined;
  }
}

export function buildContext(request: Request, services: ServiceUrls): GraphQLContext {
  const authHeader = request.headers.get('authorization');
  const token      = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const userId     = token ? decodeUserId(token) : undefined;

  return {
    token,
    userId,
    services,
    loaders: createLoaders(services.catalog, token),
  };
}
