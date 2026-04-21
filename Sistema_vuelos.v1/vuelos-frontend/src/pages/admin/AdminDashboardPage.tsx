// src/pages/admin/AdminDashboardPage.tsx
import { useFlights } from '@/hooks/useFlights';
import { useAllReservations } from '@/hooks/useReservations';
import { useAdminUsers } from '@/hooks/useAdmin';
import { Plane, BookOpen, Users, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboardPage() {
  const { data: flights, isLoading: lf }       = useFlights();
  const { data: reservations, isLoading: lr }   = useAllReservations();
  const { data: users, isLoading: lu }           = useAdminUsers();

  const confirmed = reservations?.filter(r => r.status === 'CONFIRMED').length ?? 0;
  const revenue   = reservations
    ?.filter(r => r.status === 'CONFIRMED')
    .reduce((acc, r) => acc + Number(r.totalAmount), 0) ?? 0;

  const stats = [
    { label: 'Vuelos activos',   value: flights?.length ?? 0,       icon: Plane,      color: 'bg-blue-100 text-blue-600',   to: '/admin/flights' },
    { label: 'Reservas totales', value: reservations?.length ?? 0,  icon: BookOpen,   color: 'bg-green-100 text-green-600', to: '/admin/reservations' },
    { label: 'Usuarios',         value: users?.length ?? 0,          icon: Users,      color: 'bg-purple-100 text-purple-600', to: '/admin/users' },
    { label: 'Ingresos totales', value: `$${revenue.toFixed(2)}`,    icon: TrendingUp, color: 'bg-amber-100 text-amber-600', to: '/admin/reservations' },
  ];

  const isLoading = lf || lr || lu;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(({ label, value, icon: Icon, color, to }) => (
            <Link key={label} to={to} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Últimas reservas */}
      {!isLoading && reservations && reservations.length > 0 && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Últimas reservas</h2>
            <Link to="/admin/reservations" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {reservations.slice(0, 5).map((r) => (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-mono text-xs text-gray-400">#{r.reservationCode}</span>
                  <span className="mx-2 text-gray-300">·</span>
                  <span className="text-gray-700">
                    {r.flight?.originAirportIata ?? '?'} → {r.flight?.destinationAirportIata ?? '?'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">${Number(r.totalAmount).toFixed(2)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    r.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.status === 'CONFIRMED' ? 'Confirmada' : r.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
