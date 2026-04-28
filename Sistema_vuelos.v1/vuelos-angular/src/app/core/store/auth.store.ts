import { Injectable, signal, computed } from '@angular/core';
import type { AuthUser } from '../models/domain';

const TOKEN_KEY = 'vuelos_token';
const USER_KEY = 'vuelos_user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private _user   = signal<AuthUser | null>(this.loadUser());
  private _token  = signal<string | null>(this.loadToken());

  readonly user            = this._user.asReadonly();
  readonly token           = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin         = computed(() => this._user()?.role === 'ADMIN');
  readonly isCustomer      = computed(() => this._user()?.role === 'CUSTOMER');

  private loadUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private loadToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  }

  setAuth(user: AuthUser, token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    this._user.set(user);
    this._token.set(token);
  }

  clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this._user.set(null);
    this._token.set(null);
  }
}
