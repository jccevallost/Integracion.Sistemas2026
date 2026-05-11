import * as grpc from '@grpc/grpc-js';
import jwt from 'jsonwebtoken';
import { getJwtSecret, getJwtVerifyOptions } from '../shared/security/jwt.config.js';
import prisma from '../shared/database/prisma.client.js';

export interface ServiceCaller {
  id: string;
  email: string;
  role: string;
}

export class GrpcAuthError extends Error {
  constructor(
    public readonly grpcCode: grpc.status,
    message: string,
  ) {
    super(message);
    this.name = 'GrpcAuthError';
  }
}

export async function verifyServiceToken(metadata: grpc.Metadata): Promise<ServiceCaller> {
  const values = metadata.get('authorization');
  const auth = values[0] as string | undefined;

  if (!auth?.startsWith('Bearer ')) {
    throw new GrpcAuthError(grpc.status.UNAUTHENTICATED, 'Token de autorización requerido (Bearer)');
  }

  try {
    const token = auth.slice(7);
    const payload = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions()) as any;

    const dbUser = await (prisma as any).user.findUnique({
      where: { id: payload.id },
      select: { isActive: true, tokenVersion: true },
    });

    const payloadVersion = payload.tokenVersion ?? 0;
    if (!dbUser || !dbUser.isActive || dbUser.tokenVersion !== payloadVersion) {
      throw new GrpcAuthError(grpc.status.UNAUTHENTICATED, 'Token inválido o expirado');
    }

    if (!['SERVICE', 'ADMIN'].includes(payload.role)) {
      throw new GrpcAuthError(grpc.status.PERMISSION_DENIED, 'Rol no autorizado para acceso gRPC');
    }

    return { id: payload.id, email: payload.email, role: payload.role };
  } catch (err: any) {
    if (err instanceof GrpcAuthError) throw err;
    throw new GrpcAuthError(grpc.status.UNAUTHENTICATED, 'Token inválido o expirado');
  }
}
