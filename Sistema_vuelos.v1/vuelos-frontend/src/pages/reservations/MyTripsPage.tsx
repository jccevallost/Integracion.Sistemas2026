// src/pages/reservations/MyTripsPage.tsx
import { Link } from 'react-router-dom';
import { Plane, Calendar, Users, ArrowRight, Loader2, Briefcase } from 'lucide-react';
import { useMyReservations } from '@/hooks/useReservations';
import type { Reservation } from '@/types/domain';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED:  'bg-green-100 text-green-700',
  PENDING:    'bg-yellow-100 text-yellow-700',
  CANCELLED:  'bg-red-100 text-red-700',
  COMPLETED:  'bg-gray-100 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada', PENDING: 'Pendiente',
  CANCELLED: 'Cancelada',  COMPLETED: 'Completada',
};

function ReservationCard({ r }: { r: Reservation }) {
  const flight = r.flight;
  const depStr = flight?.departureDateTime ?? flight?.departureDate;
  const dep = depStr ? new Date(depStr) : null;

  return (
    <Link
      to={`/my-trips/${r.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Plane className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {flight?.route?.originAirport.iataCode ?? flight?.originAirportIata ?? r.flightId}
              <span className="mx-2 text-gray-400">→</span>
              {flight?.route?.destinationAirport.iataCode ?? flight?.destinationAirportIata ?? ''}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{flight?.airline?.name ?? 'Aerolínea'} · {flight?.flightNumber ?? ''}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[r.status]}`}>
          {STATUS_LABELS[r.status]}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs">{dep ? format(dep, "d MMM yyyy", { locale: es }) : '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <Users className="w-3.5 h-3.5" />
          <span className="text-xs">{r.passengers?.length ?? 0} {(r.passengers?.length ?? 0) === 1 ? 'pasajero' : 'pasajeros'}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-blue-600">${Number(r.totalAmount).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-mono">#{r.reservationCode}</p>
        <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
          Ver detalle <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}

export function MyTripsPage() {
  const { data: reservations, isLoading } = useMyReservations();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis viajes</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && (!reservations || reservations.length === 0) && (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Aún no tienes reservas</h2>
          <p className="text-sm text-gray-400 mb-6">Encuentra tu próximo destino y reserva en minutos.</p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plane className="w-4 h-4" /> Buscar vuelos
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {reservations?.map((r) => <ReservationCard key={r.id} r={r} />)}
      </div>
    </div>
  );
}
