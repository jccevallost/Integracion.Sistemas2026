import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthStore);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return router.createUrlTree(['/login']);
  if (!auth.isAdmin())         return router.createUrlTree(['/']);
  return true;
};
