// src/pages/auth/RegisterPage.tsx
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Plane, Mail, Lock, User, Phone, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import type { RegisterData } from '@/types/domain';

export function RegisterPage() {
  const registerMutation = useRegister();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterData & { confirmPassword: string }>();

  const password = watch('password');
  const onSubmit = ({ confirmPassword: _, ...data }: RegisterData & { confirmPassword: string }) => {
    registerMutation.mutate(data);
  };

  const errorMessage = registerMutation.error
    ? (registerMutation.error as any)?.response?.data?.error?.message ?? 'Error al registrarse'
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
              <Plane className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-sm text-gray-500 mt-1">Únete a VuelosApp</p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre / Primer Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('firstName', { required: 'Requerido' })}
                    placeholder="Juan"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Primer Apellido *</label>
                <input
                  {...register('firstLastName', { required: 'Requerido' })}
                  placeholder="Pérez"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.firstLastName && <p className="text-xs text-red-500 mt-1">{errors.firstLastName.message}</p>}
              </div>
            </div>

            {/* Segundo nombre / Segundo Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Segundo Nombre</label>
                <input
                  {...register('secondName')}
                  placeholder="Carlos"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Segundo Apellido</label>
                <input
                  {...register('secondLastName')}
                  placeholder="García"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email', { required: 'Requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('mainAddress')}
                  placeholder="Av. Principal 123"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('phone')}
                  placeholder="+593..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password', { required: 'Requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('confirmPassword', {
                    required: 'Requerida',
                    validate: (v) => v === password || 'Las contraseñas no coinciden',
                  })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
            >
              {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {registerMutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
