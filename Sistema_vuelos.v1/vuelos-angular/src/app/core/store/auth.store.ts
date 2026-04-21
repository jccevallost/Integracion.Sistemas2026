import { Injectable, signal, computed } from '@angular/core';
import type { AuthUser } from '../models/domain';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _user   = signal<AuthUser | null>(this.loadUser());
  private _token  = signal<string | null>(localStorage.getItem('vuelos_token'));

  readonly user            = this._user.asReadonly();
  readonly token           = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin         = computed(() => this._user()?.role === 'ADMIN');
  readonly isCustomer      = computed(() => this._user()?.role === 'CUSTOMER');

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('vuelos_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  setAuth(user: AuthUser, token: string): void {
    localStorage.setItem('vuelos_token', token);
    localStorage.setItem('vuelos_user', JSON.stringify(user));
    this._user.set(user);
    this._token.set(token);
  }

  clearAuth(): void {
    localStorage.removeItem('vuelos_token');
    localStorage.removeItem('vuelos_user');
    this._user.set(null);
    this._token.set(null);
  }
}
