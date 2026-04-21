// src/services/auth.service.ts
// ============================================================
//   Capa de servicios de autenticación.
//   Los componentes React NUNCA llaman a apiClient directamente.
//   Solo llaman a estas funciones — que son las mismas en React Native.
// ============================================================
import { apiClient } from '@/lib/api-client';
import type { ApiSuccess, AuthResponse, LoginCredentials, RegisterData, User } from '@/types/domain';

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<ApiSuccess<AuthResponse>>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiClient.post<ApiSuccess<AuthResponse>>('/auth/register', data),

  me: () =>
    apiClient.get<ApiSuccess<User>>('/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put<ApiSuccess<User>>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post<ApiSuccess<{ message: string }>>('/auth/change-password', data),
};
