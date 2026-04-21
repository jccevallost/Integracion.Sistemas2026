import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationsService } from '../../../core/services/reservations.service';
import type { Reservation } from '../../../core/models/domain';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',    COMPLETED: 'bg-gray-100 text-gray-600',
};
const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada', COMPLETED: 'Completada',
};

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Mis viajes</h1>

      <div *ngIf="loading()" class="flex items-center justify-center py-20">
        <svg class="w-7 h-7 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <div *ngIf="!loading() && reservations().length === 0" class="text-center py-20">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <h2 class="text-lg font-semibold text-gray-600 mb-2">Aún no tienes reservas</h2>
        <p class="text-sm text-gray-400 mb-6">Encuentra tu próximo destino y reserva en minutos.</p>
        <a routerLink="/search" class="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          Buscar vuelos
        </a>
      </div>

      <div class="space-y-4">
        <a *ngFor="let r of reservations()" [routerLink]="['/my-trips', r.id]"
          class="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </div>
              <div>
                <p class="font-bold text-gray-900">
                  {{ r.flight?.route?.originAirport?.iataCode ?? r.flight?.originAirportIata ?? r.flightId }}
                  <span class="mx-2 text-gray-400">→</span>
                  {{ r.flight?.route?.destinationAirport?.iataCode ?? r.flight?.destinationAirportIata ?? '' }}
                </p>
                <p class="text-xs text-gray-400 mt-0.5">{{ r.flight?.airline?.name ?? 'Aerolínea' }}</p>
              </div>
            </div>
            <span [class]="'text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ' + statusStyle(r.status)">
              {{ statusLabel(r.status) }}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-3 mt-4 text-sm">
            <div class="flex items-center gap-1.5 text-gray-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span class="text-xs">{{ depDate(r) }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span class="text-xs">{{ r.passengers?.length ?? 0 }} {{ (r.passengers?.length ?? 0) === 1 ? 'pasajero' : 'pasajeros' }}</span>
            </div>
            <div class="text-right">
              <span class="text-sm font-bold text-blue-600">\${{ (+r.totalAmount).toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <p class="text-xs text-gray-400 font-mono">#{{ r.reservationCode }}</p>
            <div class="flex items-center gap-1 text-xs text-blue-600 font-medium">
              Ver detalle
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class MyTripsComponent implements OnInit {
  private svc = inject(ReservationsService);

  loading      = signal(true);
  reservations = signal<Reservation[]>([]);

  ngOnInit() {
    this.svc.myReservations().subscribe({
      next: res => { this.reservations.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  statusStyle(s: string) { return STATUS_STYLES[s] ?? 'bg-gray-100 text-gray-600'; }
  statusLabel(s: string) { return STATUS_LABELS[s] ?? s; }
  depDate(r: Reservation) {
    const d = r.flight?.departureDateTime ?? r.flight?.departureDate;
    if (!d) return '—';
    try { return format(new Date(d), "d MMM yyyy", { locale: es }); } catch { return d; }
  }
}
