// src/pages/reservations/ReservationDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plane, User, Tag, Loader2, AlertCircle, XCircle, ArrowRight,
  Luggage, Armchair, UtensilsCrossed, CheckCircle2, QrCode,
  Plus, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useReservation, useCancelReservation } from '@/hooks/useReservations';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { passengerServicesService } from '@/services/passenger-services.service';
import { boardingPassesService } from '@/services/boarding-passes.service';
import { airlineServiceConfigsService, type AirlineServiceConfig } from '@/services/airline-service-configs.service';
import type { Passenger, BoardingPass, PassengerService, Reservation } from '@/types/domain';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

// ─────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING:   'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
};
const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada', COMPLETED: 'Completada',
};

const CHECK_IN_LABELS: Record<string, { label: string; color: string }> = {
  NOT_CHECKED_IN: { label: 'Sin check-in',    color: 'text-gray-500 bg-gray-100' },
  CHECKED_IN:     { label: 'Check-in OK',      color: 'text-green-700 bg-green-100' },
  BOARDED:        { label: 'Embarcado',         color: 'text-blue-700 bg-blue-100' },
  NO_SHOW:        { label: 'No se presentó',   color: 'text-red-700 bg-red-100' },
};

const SERVICE_ICONS: Record<string, React.ElementType> = {
  BAGGAGE:       Luggage,
  SEAT:          Armchair,
  MEAL:          UtensilsCrossed,
  ENTERTAINMENT: QrCode,
  LOUNGE:        Armchair,
  INSURANCE:     CheckCircle2,
  TRANSPORT:     Plane,
  OTRO:          Plus,
};

const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  BAGGAGE: 'Equipaje', SEAT: 'Asiento', MEAL: 'Comida',
  ENTERTAINMENT: 'Entretenimiento', LOUNGE: 'Sala VIP',
  INSURANCE: 'Seguro', TRANSPORT: 'Transporte', OTRO: 'Otro',
};

function generateBoardingCode(passengerId: string): string {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BP-${passengerId.slice(0, 4).toUpperCase()}-${suffix}`;
}

// ─────────────────────────────────────────────────────────
function PassengerRow({
  passenger,
  reservation,
  serviceConfigs,
  loadingConfigs,
  canEdit,
}: {
  passenger: Passenger;
  reservation: Reservation;
  serviceConfigs: AirlineServiceConfig[];
  loadingConfigs: boolean;
  canEdit: boolean;
}) {
  const qc     = useQueryClient();
  const passId = passenger.id ?? '';
  const [expanded,       setExpanded]       = useState(false);
  const [addingService,  setAddingService]  = useState(false);
  const [selectedConfig, setSelectedConfig] = useState('');
  const [checkingIn,     setCheckingIn]     = useState(false);

  const { data: passengerServices = [], isLoading: loadingServices } = useQuery({
    queryKey: ['passenger-services', passId],
    queryFn:  () => passengerServicesService.byPassenger(passId).then(r => r.data),
    enabled:  !!passId && expanded,
  });

  const { data: boardingPasses = [], isLoading: loadingBP } = useQuery({
    queryKey: ['boarding-passes', passId],
    queryFn:  () => boardingPassesService.byPassenger(passId).then(r => r.data),
    enabled:  !!passId && expanded,
  });

  const addService = useMutation({
    mutationFn: passengerServicesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['passenger-services', passId] });
      setAddingService(false);
      setSelectedConfig('');
    },
  });

  const removeService = useMutation({
    mutationFn: passengerServicesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['passenger-services', passId] }),
  });

  const doCheckIn = useMutation({
    mutationFn: boardingPassesService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['boarding-passes', passId] });
      setCheckingIn(false);
    },
  });

  const boardingPass: BoardingPass | undefined = boardingPasses[0];
  const checkInInfo = CHECK_IN_LABELS[boardingPass?.checkInStatus ?? 'NOT_CHECKED_IN'];

  const handleAddService = () => {
    const config = serviceConfigs.find(c => c.id === selectedConfig);
    if (!config || !passId) return;
    addService.mutate({
      passengerId:        passId,
      serviceConfigId:    config.id,
      quantity:           1,
      unitPriceAtBooking: config.price,
    });
  };

  const handleCheckIn = () => {
    if (!passId) return;
    const segmentId = reservation.flight?.segments?.[0]?.id;
    if (!segmentId) {
      alert('No se encontró información del segmento de vuelo.');
      return;
    }
    doCheckIn.mutate({
      passengerId:  passId,
      segmentId,
      boardingCode: generateBoardingCode(passId),
      status:       'CHECKED_IN',
    });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">{passenger.firstName} {passenger.lastName}</p>
            <p className="text-xs text-gray-400">Doc: {passenger.documentNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${checkInInfo.color}`}>
            {checkInInfo.label}
          </span>
          {boardingPass?.boardingCode && (
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              {boardingPass.boardingCode}
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-4 space-y-5">
          {/* Check-in */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" /> Check-in
            </h4>

            {loadingBP ? (
              <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
            ) : boardingPass ? (
              <div className="bg-white border border-green-200 rounded-xl p-4 flex items-center gap-4">
                <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Check-in realizado</p>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                    <span>Código: <strong className="font-mono">{boardingPass.boardingCode}</strong></span>
                    {boardingPass.gate         && <span>Puerta: <strong>{boardingPass.gate}</strong></span>}
                    {boardingPass.boardingGroup && <span>Grupo: <strong>{boardingPass.boardingGroup}</strong></span>}
                  </div>
                </div>
              </div>
            ) : canEdit ? (
              checkingIn ? (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-gray-500">
                    Se generará un código de embarque automáticamente al confirmar.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCheckIn}
                      disabled={doCheckIn.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {doCheckIn.isPending
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Confirmar check-in
                    </button>
                    <button
                      onClick={() => setCheckingIn(false)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                  {doCheckIn.isError && (
                    <p className="text-xs text-red-500">
                      {(doCheckIn.error as any)?.response?.data?.error?.message ?? 'Error al hacer check-in'}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setCheckingIn(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  Hacer check-in
                </button>
              )
            ) : (
              <p className="text-xs text-gray-400 italic">Check-in no disponible</p>
            )}
          </div>

          {/* Servicios adicionales */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5" /> Servicios adicionales
              </span>
              {canEdit && !addingService && (
                <button
                  onClick={() => setAddingService(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-semibold normal-case tracking-normal text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              )}
            </h4>

            {loadingServices ? (
              <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
            ) : (
              <div className="space-y-2">
                {passengerServices.length === 0 && !addingService && (
                  <p className="text-xs text-gray-400 italic">Sin servicios adicionales.</p>
                )}

                {passengerServices.map((ps: PassengerService) => {
                  const cat  = ps.serviceConfig?.service?.category ?? '';
                  const Icon = SERVICE_ICONS[cat] ?? Plus;
                  return (
                    <div key={ps.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {ps.serviceConfig?.service?.name ?? 'Servicio'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {SERVICE_CATEGORY_LABELS[cat] ?? cat} · x{ps.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ps.totalPrice > 0 && (
                          <span className="text-xs font-semibold text-gray-700">
                            ${Number(ps.totalPrice).toFixed(2)}
                          </span>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => removeService.mutate(ps.id)}
                            disabled={removeService.isPending}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {addingService && canEdit && (
                  <div className="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
                    {loadingConfigs ? (
                      <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
                    ) : serviceConfigs.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No hay servicios disponibles para esta aerolínea.</p>
                    ) : (
                      <select
                        value={selectedConfig}
                        onChange={e => setSelectedConfig(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Selecciona un servicio...</option>
                        {serviceConfigs.map(c => (
                          <option key={c.id} value={c.id}>
                            {SERVICE_CATEGORY_LABELS[c.service?.category ?? ''] ?? c.service?.category} — {c.service?.name ?? c.id} (${c.price} {c.currency})
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddService}
                        disabled={!selectedConfig || addService.isPending || loadingConfigs}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {addService.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Agregar servicio
                      </button>
                      <button
                        onClick={() => { setAddingService(false); setSelectedConfig(''); }}
                        className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                    {addService.isError && (
                      <p className="text-xs text-red-500">
                        {(addService.error as any)?.response?.data?.error?.message ?? 'Error al agregar servicio'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
export function ReservationDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: reservation, isLoading, isError } = useReservation(id!);
  const cancel = useCancelReservation();

  const airlineId = reservation?.flight?.airline?.id;

  const { data: serviceConfigs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['airline-service-configs', airlineId],
    queryFn:  () => airlineId
      ? airlineServiceConfigsService.byAirline(airlineId).then(r => r.data)
      : airlineServiceConfigsService.list().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    enabled:   !!reservation,
  });

  const handleCancel = () => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    cancel.mutate(id!, { onSuccess: () => navigate('/my-trips') });
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
    </div>
  );

  if (isError || !reservation) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <p className="text-sm text-red-700">No se pudo cargar la reserva.</p>
      </div>
    </div>
  );

  const flight  = reservation.flight;
  const depStr  = flight?.departureDateTime ?? flight?.departureDate;
  const arrStr  = flight?.arrivalDateTime;
  const dep     = depStr ? new Date(depStr) : null;
  const arr     = arrStr ? new Date(arrStr) : null;
  const canEdit = reservation.status === 'CONFIRMED' || reservation.status === 'PENDING';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <button
        onClick={() => navigate('/my-trips')}
        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
      >
        ← Mis viajes
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reserva #{reservation.reservationCode}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Creada el {format(new Date(reservation.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_STYLES[reservation.status]}`}>
          {STATUS_LABELS[reservation.status]}
        </span>
      </div>

      {/* Vuelo */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-4 h-4 text-blue-600" />
          <p className="font-semibold text-gray-800">
            {flight?.airline?.name ?? 'Aerolínea'} {flight?.flightNumber ? `· ${flight.flightNumber}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">{dep ? format(dep, 'HH:mm') : '--:--'}</p>
            <p className="text-xs font-bold text-gray-500 mt-0.5">
              {flight?.route?.originAirport.iataCode ?? flight?.originAirportIata ?? ''}
            </p>
            <p className="text-xs text-gray-400">{flight?.route?.originAirport.city ?? ''}</p>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 h-px bg-gray-200" />
            <ArrowRight className="w-4 h-4 text-gray-300" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">{arr ? format(arr, 'HH:mm') : '--:--'}</p>
            <p className="text-xs font-bold text-gray-500 mt-0.5">
              {flight?.route?.destinationAirport.iataCode ?? flight?.destinationAirportIata ?? ''}
            </p>
            <p className="text-xs text-gray-400">{flight?.route?.destinationAirport.city ?? ''}</p>
          </div>
        </div>
        {dep && (
          <p className="text-xs text-gray-400 mt-3">
            {format(dep, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        )}
      </div>

      {/* Pasajeros + servicios + check-in */}
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-4 h-4" />
          Pasajeros ({reservation.passengers?.length ?? 0})
          {canEdit && (
            <span className="text-xs font-normal text-gray-400 ml-1">
              · Expande cada pasajero para servicios y check-in
            </span>
          )}
        </h2>

        {(reservation.passengers ?? []).map((p, i) => (
          <PassengerRow
            key={p.id ?? i}
            passenger={p}
            reservation={reservation}
            serviceConfigs={serviceConfigs}
            loadingConfigs={loadingConfigs}
            canEdit={canEdit}
          />
        ))}
      </div>

      {/* Precio */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-3">Resumen de precio</h2>
        {reservation.promotion && (
          <div className="flex items-center justify-between text-sm text-green-600 mb-2">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {reservation.promotion.code}
            </span>
            <span>Descuento aplicado</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-800">Total pagado</span>
          <span className="text-2xl font-bold text-blue-600">
            ${Number(reservation.totalAmount).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Cancelar */}
      {canEdit && (
        <button
          onClick={handleCancel}
          disabled={cancel.isPending}
          className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancel.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <XCircle className="w-4 h-4" />}
          {cancel.isPending ? 'Cancelando...' : 'Cancelar reserva'}
        </button>
      )}
    </div>
  );
}
