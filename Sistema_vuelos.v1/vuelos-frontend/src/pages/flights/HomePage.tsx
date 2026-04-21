// src/pages/flights/HomePage.tsx
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  Search, Plane, Shield, Clock, ArrowLeftRight,
  Minus, Plus, Tag, ChevronRight, MapPin,
} from 'lucide-react';
import type { FlightSearchParams } from '@/types/domain';

const POPULAR_AIRPORTS = [
  { code: 'UIO', city: 'Quito' },
  { code: 'GYE', city: 'Guayaquil' },
  { code: 'BOG', city: 'Bogotá' },
  { code: 'LIM', city: 'Lima' },
  { code: 'SCL', city: 'Santiago' },
  { code: 'MIA', city: 'Miami' },
];

const POPULAR_ROUTES = [
  { from: 'UIO', to: 'GYE', fromCity: 'Quito',     toCity: 'Guayaquil', price: 89,  color: 'from-blue-500 to-blue-700' },
  { from: 'UIO', to: 'BOG', fromCity: 'Quito',     toCity: 'Bogotá',    price: 145, color: 'from-indigo-500 to-purple-700' },
  { from: 'GYE', to: 'LIM', fromCity: 'Guayaquil', toCity: 'Lima',      price: 198, color: 'from-teal-500 to-cyan-700' },
  { from: 'UIO', to: 'MIA', fromCity: 'Quito',     toCity: 'Miami',     price: 350, color: 'from-orange-500 to-red-600' },
];

const TODAY = new Date().toISOString().split('T')[0];

export function HomePage() {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState(1);

  const { register, handleSubmit, watch, setValue } = useForm<FlightSearchParams>({
    defaultValues: { passengers: 1, date: TODAY },
  });

  const origin      = watch('origin', '');
  const destination = watch('destination', '');

  const changePassengers = (delta: number) => {
    const next = Math.min(9, Math.max(1, passengers + delta));
    setPassengers(next);
    setValue('passengers', next);
  };

  const handleSwap = () => {
    const o = origin;
    setValue('origin', destination?.toUpperCase() || '');
    setValue('destination', o?.toUpperCase() || '');
  };

  const quickSearch = (from: string, to: string) => {
    const params = new URLSearchParams({ origin: from, destination: to, date: TODAY, passengers: '1' });
    navigate(`/results?${params}`);
  };

  const onSearch = (data: FlightSearchParams) => {
    const params = new URLSearchParams({
      origin:      data.origin.toUpperCase(),
      destination: data.destination.toUpperCase(),
      date:        data.date,
      passengers:  String(passengers),
      ...(data.class ? { class: data.class } : {}),
    });
    navigate(`/results?${params}`);
  };

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Encuentra tu próximo vuelo
          </h1>
          <p className="text-blue-200 text-lg">
            Compara precios, horarios y clases en segundos
          </p>
        </div>

        {/* ── Search Card ── */}
        <form
          onSubmit={handleSubmit(onSearch)}
          className="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-2xl"
        >
          {/* Row 1: Origen | Swap | Destino | Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_1fr] gap-3 items-start mb-4">
            {/* Origen */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Origen
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  {...register('origin', { required: true })}
                  placeholder="UIO — Quito"
                  maxLength={3}
                  className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm font-bold text-gray-900 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none placeholder:normal-case placeholder:font-normal placeholder:text-gray-400 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {POPULAR_AIRPORTS.slice(0, 3).map(a => (
                  <button
                    key={a.code}
                    type="button"
                    onClick={() => setValue('origin', a.code)}
                    title={a.city}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full transition-colors font-medium"
                  >
                    {a.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap */}
            <button
              type="button"
              onClick={handleSwap}
              className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-colors mt-7 self-start"
              title="Intercambiar origen y destino"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Destino */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Destino
              </label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  {...register('destination', { required: true })}
                  placeholder="BOG — Bogotá"
                  maxLength={3}
                  className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm font-bold text-gray-900 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none placeholder:normal-case placeholder:font-normal placeholder:text-gray-400 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {POPULAR_AIRPORTS.slice(1, 4).map(a => (
                  <button
                    key={a.code}
                    type="button"
                    onClick={() => setValue('destination', a.code)}
                    title={a.city}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full transition-colors font-medium"
                  >
                    {a.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Fecha de salida
              </label>
              <input
                {...register('date', { required: true })}
                type="date"
                min={TODAY}
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Pasajeros | Clase | Buscar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            {/* Pasajeros */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Pasajeros
              </label>
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white">
                <button
                  type="button"
                  onClick={() => changePassengers(-1)}
                  disabled={passengers <= 1}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900 select-none">
                  {passengers}
                </span>
                <button
                  type="button"
                  onClick={() => changePassengers(1)}
                  disabled={passengers >= 9}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <span className="text-xs text-gray-400 ml-1 select-none">
                  {passengers === 1 ? 'adulto' : 'adultos'}
                </span>
              </div>
            </div>

            {/* Clase */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Clase
              </label>
              <select
                {...register('class')}
                className="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none bg-white transition-colors"
              >
                <option value="">Cualquier clase</option>
                <option value="ECONOMY">Económica</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">Primera clase</option>
              </select>
            </div>

            <button
              type="submit"
              className="sm:ml-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              Buscar vuelos
            </button>
          </div>
        </form>

        {/* ── Rutas rápidas ── */}
        <div className="max-w-5xl mx-auto mt-5">
          <p className="text-blue-200 text-xs font-medium mb-2">Rutas populares:</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ROUTES.map(r => (
              <button
                key={`${r.from}-${r.to}`}
                type="button"
                onClick={() => quickSearch(r.from, r.to)}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-full transition-colors border border-white/20"
              >
                {r.fromCity} → {r.toCity}
                <span className="text-blue-200 font-medium">desde ${r.price}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { icon: Plane,  title: 'Múltiples aerolíneas',  desc: 'Compara vuelos de Avianca, LATAM, American Airlines y más.' },
          { icon: Shield, title: 'Reserva segura',         desc: 'Tus datos y pago están protegidos en todo momento.' },
          { icon: Clock,  title: 'Confirmación inmediata', desc: 'Recibe tu código de reserva al instante.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>

      {/* ── Ofertas recomendadas ── */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ofertas recomendadas</h2>
              <p className="text-sm text-gray-500 mt-1">Las mejores rutas al mejor precio</p>
            </div>
            <Tag className="w-6 h-6 text-blue-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {POPULAR_ROUTES.map(r => (
              <button
                key={`offer-${r.from}-${r.to}`}
                onClick={() => quickSearch(r.from, r.to)}
                className={`bg-gradient-to-br ${r.color} text-white rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <span className="text-2xl font-black">{r.from}</span>
                    <p className="text-xs opacity-70 mt-0.5">{r.fromCity}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-60" />
                  <div className="text-center">
                    <span className="text-2xl font-black">{r.to}</span>
                    <p className="text-xs opacity-70 mt-0.5">{r.toCity}</p>
                  </div>
                </div>
                <div className="border-t border-white/20 pt-3 mt-2">
                  <p className="text-xs opacity-70">desde</p>
                  <p className="text-3xl font-black">${r.price}</p>
                  <p className="text-xs opacity-70 mt-0.5">por persona · ida</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
