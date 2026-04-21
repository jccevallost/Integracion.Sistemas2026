// src/store/auth.store.ts
// ============================================================
//   Estado global de autenticación con Zustand.
//
//   RETO 3 (React Native): este mismo store funciona con
//   AsyncStorage en lugar de localStorage. Solo cambia el
//   adapter de persistencia, no la lógica.
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/domain';
type User = AuthUser;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null as AuthUser | null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: AuthUser, token: string) => {
        // Guardar token para el ApiClient interceptor
        localStorage.setItem('vuelos_token', token);
        localStorage.setItem('vuelos_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('vuelos_token');
        localStorage.removeItem('vuelos_user');
        set({ user: null, token: null, isAuthenticated: false });
      },

      isAdmin: () => get().user?.role === 'ADMIN',
      isCustomer: () => get().user?.role === 'CUSTOMER',
    }),
    {
      name: 'vuelos_auth',
      // Solo persistir user y token (no las funciones)
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
