// src/shared/utils/response.ts
import { Response } from 'express';

/**
 * Respuesta de éxito estándar.
 * Todos los endpoints devuelven este formato.
 */
export function ok<T>(res: Response, data: T, meta?: object): void {
  res.json({ success: true, data, ...(meta && { meta }) });
}

export function created<T>(res: Response, data: T): void {
  res.status(201).json({ success: true, data });
}

export function noContent(res: Response): void {
  res.status(204).send();
}

/**
 * Respuesta de error estándar.
 */
export function error(
  res: Response,
  status: number,
  code: string,
  message: string
): void {
  res.status(status).json({ success: false, error: { code, message } });
}

export function notFound(res: Response, entity = 'Recurso'): void {
  error(res, 404, 'NOT_FOUND', `${entity} no encontrado`);
}

export function badRequest(res: Response, message: string): void {
  error(res, 400, 'BAD_REQUEST', message);
}

export function conflict(res: Response, message: string): void {
  error(res, 409, 'CONFLICT', message);
}

export function unauthorized(res: Response, message = 'No autorizado'): void {
  error(res, 401, 'UNAUTHORIZED', message);
}
