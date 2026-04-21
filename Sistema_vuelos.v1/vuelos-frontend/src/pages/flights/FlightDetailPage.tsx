// src/pages/flights/FlightDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Plane, Clock, ArrowRight, Luggage, Loader2, AlertCircle } from 'lucide-react';
import { useFlight } from '@/hooks/useFlights';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatDuration(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ''}`;
}

const CLASS_LABELS: Record<string, string> = {
  ECONOMY: 'Económica', BUSINESS: 'Business', FIRST: 'Primera clase',
};

export function FlightDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: flight, isLoading, isError } = useFlight(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !flight) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">No se pudo cargar la información del vuelo.</p>
        </div>
      </div>
    );
  }

  const dep = flight.departureDateTime ? new Date(flight.departureDateTime) : null;
  const arr = flight.arrivalDateTime ? new Date(flight.arrivalDateTime) : null;
  const route = flight.route;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
          ← Volver a resultados
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detalle del vuelo</h1>
      </div>

      {/* Info del vuelo */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{flight.airline?.name ?? 'Aerolínea'}</p>
            <p className="text-sm text-gray-400">Vuelo {flight.flightNumber ?? flight.originAirportIata} · {flight.aircraft ?? 'Aeronave comercial'}</p>
          </div>
          <span className="ml-auto text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
            {flight.status === 'SCHEDULED' ? 'A tiempo' : flight.status}
          </span>
        </div>

        {/* Ruta */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-4xl font-bold text-gray-900">{dep ? format(dep, 'HH:mm') : '--:--'}</p>
            <p className="text-sm font-bold text-gray-600 mt-1">{route?.originAirport.iataCode ?? flight.originAirportIata}</p>
            <p className="text-sm text-gray-400">{route?.originAirport.name ?? ''}</p>
            <p className="text-xs text-gray-400">{route?.originAirport.city ?? ''}{route?.originAirport.country ? `, ${route.originAirport.country}` : ''}</p>
            {dep && <p className="text-xs text-gray-400 mt-1">{format(dep, "d 'de' MMMM, yyyy", { locale: es })}</p>}
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              {route ? formatDuration(route.estimatedDuration) : (flight.duration ? formatDuration(flight.duration) : '')}
            </div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gray-300" />
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400">Directo</p>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold text-gray-900">{arr ? format(arr, 'HH:mm') : '--:--'}</p>
            <p className="text-sm font-bold text-gray-600 mt-1">{route?.destinationAirport.iataCode ?? flight.destinationAirportIata}</p>
            <p className="text-sm text-gray-400">{route?.destinationAirport.name ?? ''}</p>
            <p className="text-xs text-gray-400">{route?.destinationAirport.city ?? ''}{route?.destinationAirport.country ? `, ${route.destinationAirport.country}` : ''}</p>
            {arr && <p className="text-xs text-gray-400 mt-1">{format(arr, "d 'de' MMMM, yyyy", { locale: es })}</p>}
          </div>
        </div>
      </div>

      {/* Clases disponibles */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Clases disponibles</h2>
        {(flight.flightClasses ?? []).map((fc) => (
          <div key={fc.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                fc.classType === 'FIRST' ? 'bg-purple-100 text-purple-700' :
                fc.classType === 'BUSINESS' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {CLASS_LABELS[fc.classType] ?? fc.classType}
              </span>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Luggage className="w-4 h-4" />
                  Equipaje incluido
                </span>
                <span>{fc.availableSeats} asientos disponibles</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-blue-600">${Number(fc.basePrice).toFixed(2)}</p>
              <p className="text-xs text-gray-400 mb-3">por persona</p>
              <button
                onClick={() => navigate(`/reservations/new/${fc.id}`)}
                disabled={fc.availableSeats === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {fc.availableSeats === 0 ? 'Sin disponibilidad' : 'Reservar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
