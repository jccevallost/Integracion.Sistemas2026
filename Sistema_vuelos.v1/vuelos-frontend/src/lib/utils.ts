// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

// shadcn/ui helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formato de precios
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Formato de fechas
export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM yyyy", { locale: es });
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm');
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), "d MMM · HH:mm", { locale: es });
}

// Duración de vuelo en horas y minutos
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Calcular duración entre dos fechas ISO
export function flightDuration(departure: string, arrival: string): string {
  const mins = differenceInMinutes(parseISO(arrival), parseISO(departure));
  return formatDuration(mins);
}

// Etiqueta de clase tarifaria
export function classLabel(classType: string): string {
  const labels: Record<string, string> = {
    ECONOMY: 'Económica',
    BUSINESS: 'Business',
    FIRST: 'Primera Clase',
  };
  return labels[classType] ?? classType;
}

// Etiqueta de estado de reserva
export function reservationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Completada',
  };
  return labels[status] ?? status;
}

export function reservationStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    CONFIRMED: 'text-green-600 bg-green-50 border-green-200',
    CANCELLED: 'text-red-600 bg-red-50 border-red-200',
    COMPLETED: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  return colors[status] ?? 'text-gray-600 bg-gray-50';
}

// Generar código de color para aerolínea (fallback sin logo)
export function airlineColor(iataCode: string): string {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];
  const index = iataCode.charCodeAt(0) % colors.length;
  return colors[index];
}
