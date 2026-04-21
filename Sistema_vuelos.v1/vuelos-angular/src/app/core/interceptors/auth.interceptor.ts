import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../store/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth   = inject(AuthStore);
  const router = inject(Router);

  const token = auth.token();
  const correlationId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

  const authReq = req.clone({
    setHeaders: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Correlation-Id': correlationId,
    },
  });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.clearAuth();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
