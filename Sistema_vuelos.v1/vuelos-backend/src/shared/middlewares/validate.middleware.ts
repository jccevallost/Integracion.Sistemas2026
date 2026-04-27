// shared/middlewares/validate.middleware.ts
// Middleware de validación con Zod — genera errores 400 con detalle de campos.
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

function formatZodError(err: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join('.') || '_root';
    if (!fields[path]) fields[path] = issue.message;
  }
  return fields;
}

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fields = formatZodError(result.error);
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          fields,
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const fields = formatZodError(result.error);
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parámetros de consulta inválidos',
          fields,
        },
      });
      return;
    }
    next();
  };
}
