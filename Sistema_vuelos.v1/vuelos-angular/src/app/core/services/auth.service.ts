import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import type { ApiSuccess, AuthResponse, LoginCredentials, RegisterData, User } from '../models/domain';

const BASE = 'http://https://integracion-sistemas2026.onrender.com/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http  = inject(HttpClient);
  private store = inject(AuthStore);

  login(credentials: LoginCredentials) {
    return this.http.post<ApiSuccess<AuthResponse>>(`${BASE}/auth/login`, credentials).pipe(
      tap(res => this.store.setAuth(res.data.user, res.data.token))
    );
  }

  register(data: RegisterData) {
    return this.http.post<ApiSuccess<AuthResponse>>(`${BASE}/auth/register`, data).pipe(
      tap(res => this.store.setAuth(res.data.user, res.data.token))
    );
  }

  me() {
    return this.http.get<ApiSuccess<User>>(`${BASE}/auth/me`);
  }
}
