import * as grpc from '@grpc/grpc-js';
import {
  BusinessException,
  NotFoundException,
  ValidationException,
  ForbiddenException,
  NoAvailabilityException,
  ConflictException,
} from '../shared/exceptions/BusinessException.js';
import { GrpcAuthError } from './auth-helper.js';

export function toGrpcError(err: unknown): { code: grpc.status; message: string } {
  if (err instanceof GrpcAuthError) {
    return { code: err.grpcCode, message: err.message };
  }
  if (err instanceof NotFoundException) {
    return { code: grpc.status.NOT_FOUND, message: err.message };
  }
  if (err instanceof ValidationException) {
    return { code: grpc.status.INVALID_ARGUMENT, message: err.message };
  }
  if (err instanceof ForbiddenException) {
    return { code: grpc.status.PERMISSION_DENIED, message: err.message };
  }
  if (err instanceof NoAvailabilityException) {
    return { code: grpc.status.RESOURCE_EXHAUSTED, message: err.message };
  }
  if (err instanceof ConflictException) {
    return { code: grpc.status.ALREADY_EXISTS, message: err.message };
  }
  if (err instanceof BusinessException) {
    return { code: grpc.status.FAILED_PRECONDITION, message: err.message };
  }
  const message = err instanceof Error ? err.message : 'Error interno del servidor';
  console.error('[gRPC] Error no controlado:', err);
  return { code: grpc.status.INTERNAL, message };
}
