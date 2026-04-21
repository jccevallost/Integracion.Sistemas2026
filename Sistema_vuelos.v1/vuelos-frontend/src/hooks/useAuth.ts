// src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials, RegisterData, AuthUser } from '@/types/domain';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (res) => {
      const { user, token } = res.data as { user: AuthUser; token: string };
      setAuth(user, token);
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (res) => {
      const { user, token } = res.data as { user: AuthUser; token: string };
      setAuth(user, token);
      navigate('/');
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    clearAuth();
    navigate('/login');
  };
}

// ─────────────────────────────────────────────────────────────
// src/hooks/useAdmin.ts
// ─────────────────────────────────────────────────────────────
export { };
