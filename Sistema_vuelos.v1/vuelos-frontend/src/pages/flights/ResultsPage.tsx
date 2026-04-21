// src/pages/flights/ResultsPage.tsx
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plane, Clock, Filter, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useFlightSearch } from '@/hooks/useFlights';
import type { FlightSearchParams, Flight, ClassType } from '@/types/domain';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m > 0 ? `${m}m` : ''}`;
}

function FlightCard({ flight, passengers }: { flight: Flight; passengers: number }) {
  const navigate = useNavigate();
  const dep = flight.departureDateTime ? new Date(flight.departureDateTime) : null;
  const arr = flight.arrivalDateTime ? new Date(flight.arrivalDateTime) : null;
  const route = flight.route;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Cabecera: aerolínea + número */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Plane className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{flight.airline?.name ?? 'Aerolínea'}</p>
            <p className="text-xs text-gray-400">{flight.flightNumber ?? flight.originAirportIata}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          flight.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {flight.status === 'SCHEDULED' ? 'A tiempo' : flight.status}
        </span>
      </div>

      {/* Ruta y horario */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{dep ? format(dep, 'HH:mm') : '--:--'}</p>
          <p className="text-xs font-semibold text-gray-500">{route?.originAirport.iataCode ?? flight.originAirportIata}</p>
          <p className="text-xs text-gray-400">{route?.originAirport.city ?? ''}</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {route ? formatDuration(route.estimatedDuration) : (flight.duration ? formatDuration(flight.duration) : '')}
          </p>
          <div className="w-full flex items-center gap-1">
            <div className="flex-1 h-px bg-gray-300" />
            <ArrowRight className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400">{flight.aircraft ?? 'Aeronave comercial'}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{arr ? format(arr, 'HH:mm') : '--:--'}</p>
          <p className="text-xs font-semibold text-gray-500">{route?.destinationAirport.iataCode ?? flight.destinationAirportIata}</p>
          <p className="text-xs text-gray-400">{route?.destinationAirport.city ?? ''}</p>
        </div>
      </div>

      {/* Clases disponibles */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        {(flight.flightClasses ?? []).map((fc) => (
          <div key={fc.id} className="flex items-center justify-between">
            <div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                fc.classType === 'FIRST' ? 'bg-purple-100 text-purple-700' :
                fc.classType === 'BUSINESS' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {fc.classType === 'ECONOMY' ? 'Económica' : fc.classType === 'BUSINESS' ? 'Business' : 'Primera'}
              </span>
              <span className="text-xs text-gray-400 ml-2">{fc.availableSeats} asientos</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">${(fc.basePrice * passengers).toFixed(2)}</p>
                {passengers > 1 && <p className="text-xs text-gray-400">${fc.basePrice.toFixed(2)} × {passengers}</p>}
              </div>
              <button
                onClick={() => navigate(`/reservations/new/${fc.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                Reservar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('departure');

  const params: FlightSearchParams = {
    origin: searchParams.get('origin') ?? '',
    destination: searchParams.get('destination') ?? '',
    date: searchParams.get('date') ?? '',
    passengers: Number(searchParams.get('passengers') ?? 1),
    class: (searchParams.get('class') as ClassType) || undefined,
  };

  const { data: flights, isLoading, isError, error } = useFlightSearch(params);

  const sorted = [...(flights ?? [])].sort((a, b) => {
    if (sortBy === 'price') {
      const aMin = Math.min(...(a.flightClasses ?? []).map(fc => fc.basePrice));
      const bMin = Math.min(...(b.flightClasses ?? []).map(fc => fc.basePrice));
      return aMin - bMin;
    }
    if (sortBy === 'duration') return (a.route?.estimatedDuration ?? a.duration ?? 0) - (b.route?.estimatedDuration ?? b.duration ?? 0);
    return new Date(a.departureDateTime ?? a.departureDate).getTime() - new Date(b.departureDateTime ?? b.departureDate).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {params.origin} → {params.destination}
          </h1>
          <p className="text-sm text-gray-500">
            {params.date ? format(new Date(params.date + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es }) : ''}
            {' · '}{params.passengers} {params.passengers === 1 ? 'pasajero' : 'pasajeros'}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="departure">Hora de salida</option>
            <option value="price">Precio</option>
            <option value="duration">Duración</option>
          </select>
        </div>
      </div>

      {/* Estados */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Buscando los mejores vuelos...</p>
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            {(error as any)?.response?.data?.error?.message ?? 'Error al buscar vuelos. Verifica los datos e intenta nuevamente.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <div className="text-center py-20">
          <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Sin vuelos disponibles</h2>
          <p className="text-sm text-gray-400">No encontramos vuelos para esta ruta y fecha. Prueba con otra fecha.</p>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-4">
        {sorted.map((flight) => (
          <FlightCard key={flight.id} flight={flight} passengers={params.passengers} />
        ))}
      </div>
    </div>
  );
}
