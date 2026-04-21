// src/pages/auth/LoginPage.tsx
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Plane, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import type { LoginCredentials } from '@/types/domain';

export function LoginPage() {
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();

  const onSubmit = (data: LoginCredentials) => login.mutate(data);

  const errorMessage = login.error
    ? (login.error as any)?.response?.data?.error?.message ?? 'Error al iniciar sesión'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
            <p className="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
          </div>

          {/* Error global */}
          {errorMessage && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email', {
                    required: 'El email es requerido',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                  })}
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {login.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {login.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 mb-2">Credenciales de prueba:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><span className="font-medium">Admin:</span> admin@vuelosapp.com / admin123</p>
              <p><span className="font-medium">Cliente:</span> cliente@gmail.com / cliente123</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
