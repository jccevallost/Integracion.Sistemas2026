// src/pages/reservations/ReservationPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { useFlight } from '@/hooks/useFlights';
import { useCreateReservation } from '@/hooks/useReservations';
import { promotionsService } from '@/services/promotions.service';
import { paymentsService } from '@/services/payments.service';
import {
  Plane, User, Plus, Trash2, Tag, Loader2, CheckCircle2,
  AlertCircle, ArrowRight, CreditCard, Lock, ChevronLeft,
} from 'lucide-react';
import type { PromotionValidation } from '@/types/domain';

interface PassengerInput {
  firstName: string;
  lastName: string;
  documentNumber: string;
}

interface FormValues {
  passengers: PassengerInput[];
  promotionCode: string;
}

interface PaymentFormValues {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  provider: string;
}

const CARD_PROVIDERS = [
  { value: 'VISA',       label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'AMEX',       label: 'American Express' },
  { value: 'PAYPAL',     label: 'PayPal' },
];

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function generateTxId() {
  return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function ReservationPage() {
  const { flightClassId } = useParams<{ flightClassId: string }>();
  const navigate = useNavigate();
  const createReservation = useCreateReservation();

  const [step, setStep] = useState<1 | 2>(1);
  const [promoResult, setPromoResult] = useState<PromotionValidation | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [cardDisplay, setCardDisplay] = useState('');

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      passengers: [{ firstName: '', lastName: '', documentNumber: '' }],
      promotionCode: '',
    },
  });

  const {
    register: regPay,
    handleSubmit: handlePay,
    formState: { errors: payErrors },
  } = useForm<PaymentFormValues>({
    defaultValues: { provider: 'VISA' },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'passengers' });
  const promotionCode = watch('promotionCode');
  const passengers    = watch('passengers');

  const handleValidatePromo = async () => {
    if (!promotionCode) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const base = 100 * passengers.length;
      const res  = await promotionsService.validate(promotionCode, base);
      setPromoResult(res.data);
    } catch (err: any) {
      setPromoError(err?.response?.data?.error?.message ?? 'Código inválido');
      setPromoResult(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const onSubmitPassengers = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmitPayment = async (payData: PaymentFormValues) => {
    setPayError(null);
    setPayLoading(true);

    const passengerData = passengers;
    createReservation.mutate(
      {
        flightClassId: flightClassId!,
        passengers: passengerData,
        promotionCode: promoResult ? promotionCode : undefined,
      },
      {
        onSuccess: async (res) => {
          const reservation = res.data;
          try {
            await paymentsService.create({
              reservationId: reservation.id,
              amount:        reservation.totalAmount,
              provider:      payData.provider,
              transactionId: generateTxId(),
            });
          } catch {
            // Payment registration failed silently — reservation was still created
          }
          setPayLoading(false);
          navigate(`/my-trips/${reservation.id}`);
        },
        onError: (err: any) => {
          setPayError(err?.response?.data?.error?.message ?? 'Error al crear la reserva');
          setPayLoading(false);
        },
      }
    );
  };

  const errorMessage = payError;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => step === 2 ? setStep(1) : navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-6 flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {step === 2 ? 'Volver a datos de pasajeros' : 'Volver'}
      </button>

      {/* Progress steps */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: 'Pasajeros' },
          { n: 2, label: 'Pago' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
              step === n ? 'bg-blue-600 text-white' :
              step > n   ? 'bg-green-500 text-white' :
                           'bg-gray-200 text-gray-500'
            }`}>
              {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
            </div>
            <span className={`text-sm font-medium ${step === n ? 'text-blue-700' : 'text-gray-400'}`}>{label}</span>
            {i < 1 && <div className={`flex-1 h-0.5 mx-2 ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {step === 1 ? 'Datos de pasajeros' : 'Información de pago'}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        {step === 1
          ? 'Ingresa los datos de todos los pasajeros'
          : 'Ingresa los datos de tu tarjeta para finalizar la compra'}
      </p>

      {errorMessage && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* ── PASO 1: Pasajeros ── */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmitPassengers)} className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Pasajeros</h2>
              <button
                type="button"
                onClick={() => append({ firstName: '', lastName: '', documentNumber: '' })}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir pasajero
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                      <User className="w-4 h-4" />
                      Pasajero {index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'firstName' as const,     label: 'Nombre',       placeholder: 'Juan' },
                      { key: 'lastName' as const,       label: 'Apellido',     placeholder: 'Pérez' },
                      { key: 'documentNumber' as const, label: 'N° documento', placeholder: 'A1234567' },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                        <input
                          {...register(`passengers.${index}.${key}`, { required: 'Requerido' })}
                          placeholder={placeholder}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {errors.passengers?.[index]?.[key] && (
                          <p className="text-xs text-red-500 mt-0.5">{errors.passengers[index]?.[key]?.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Código de promoción */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              ¿Tienes un código de descuento?
            </h2>
            <div className="flex gap-2">
              <input
                {...register('promotionCode')}
                placeholder="Ej: VERANO25"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
              <button
                type="button"
                onClick={handleValidatePromo}
                disabled={promoLoading || !promotionCode}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
              </button>
            </div>

            {promoResult && (
              <div className="mt-3 flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Código <strong>{promoResult.code}</strong> aplicado — Ahorro: ${promoResult.discountAmount.toFixed(2)}
              </div>
            )}
            {promoError && (
              <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {promoError}
              </p>
            )}
          </section>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Continuar al pago <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* ── PASO 2: Pago ── */}
      {step === 2 && (
        <form onSubmit={handlePay(onSubmitPayment)} className="space-y-6">
          {/* Resumen pasajeros */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Resumen de la reserva</p>
            <div className="space-y-1">
              {passengers.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>{p.firstName} {p.lastName} — {p.documentNumber}</span>
                </div>
              ))}
              {promoResult && (
                <div className="flex items-center gap-2 text-sm text-green-600 mt-2 pt-2 border-t border-blue-200">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Descuento <strong>{promoResult.code}</strong>: -${promoResult.discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Método de pago */}
          <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Método de pago
            </h2>

            {/* Provider */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Tipo de tarjeta</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CARD_PROVIDERS.map(p => (
                  <label key={p.value} className="cursor-pointer">
                    <input {...regPay('provider')} type="radio" value={p.value} className="sr-only peer" />
                    <div className="border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 rounded-lg px-3 py-2 text-center text-xs font-semibold text-gray-600 peer-checked:text-blue-700 transition-colors">
                      {p.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Nombre en la tarjeta */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre en la tarjeta</label>
              <input
                {...regPay('cardholderName', { required: 'Requerido' })}
                placeholder="JUAN PÉREZ"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
              {payErrors.cardholderName && (
                <p className="text-xs text-red-500 mt-0.5">{payErrors.cardholderName.message}</p>
              )}
            </div>

            {/* Número de tarjeta */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Número de tarjeta</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...regPay('cardNumber', {
                    required: 'Requerido',
                    pattern: { value: /^[\d\s]{19}$/, message: 'Número de tarjeta inválido (16 dígitos)' },
                  })}
                  placeholder="1234 5678 9012 3456"
                  value={cardDisplay}
                  onChange={e => {
                    const formatted = formatCardNumber(e.target.value);
                    setCardDisplay(formatted);
                    e.target.value = formatted;
                  }}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {payErrors.cardNumber && (
                <p className="text-xs text-red-500 mt-0.5">{payErrors.cardNumber.message}</p>
              )}
            </div>

            {/* Expiración + CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vencimiento</label>
                <input
                  {...regPay('expiry', {
                    required: 'Requerido',
                    pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Formato MM/AA' },
                  })}
                  placeholder="MM/AA"
                  maxLength={5}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                    e.target.value = v;
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {payErrors.expiry && (
                  <p className="text-xs text-red-500 mt-0.5">{payErrors.expiry.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">CVV</label>
                <input
                  {...regPay('cvv', {
                    required: 'Requerido',
                    pattern: { value: /^\d{3,4}$/, message: '3 o 4 dígitos' },
                  })}
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {payErrors.cvv && (
                  <p className="text-xs text-red-500 mt-0.5">{payErrors.cvv.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Nota de seguridad */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            Transacción cifrada con SSL. Tus datos financieros están protegidos.
          </div>

          <button
            type="submit"
            disabled={payLoading || createReservation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md"
          >
            {payLoading || createReservation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando pago...</>
              : <><Lock className="w-4 h-4" /> Confirmar y pagar</>
            }
          </button>
        </form>
      )}
    </div>
  );
}
