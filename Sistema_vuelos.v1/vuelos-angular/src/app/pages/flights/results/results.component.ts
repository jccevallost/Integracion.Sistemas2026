import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlightsService } from '../../../core/services/flights.service';
import type { Flight, FlightSearchParams } from '../../../core/models/domain';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m > 0 ? `${m}m` : ''}`;
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold text-gray-900">{{ params().origin }} → {{ params().destination }}</h1>
          <p class="text-sm text-gray-500">
            {{ formattedDate() }} · {{ params().passengers }} {{ params().passengers === 1 ? 'pasajero' : 'pasajeros' }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          <select [(ngModel)]="sortBy" class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="departure">Hora de salida</option>
            <option value="price">Precio</option>
            <option value="duration">Duración</option>
          </select>
        </div>
      </div>

      <div *ngIf="loading()" class="flex flex-col items-center justify-center py-20 gap-3">
        <svg class="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <p class="text-sm text-gray-500">Buscando los mejores vuelos...</p>
      </div>

      <div *ngIf="error()" class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
        <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="text-sm text-red-700">{{ error() }}</p>
      </div>

      <div *ngIf="!loading() && !error() && sorted().length === 0" class="text-center py-20">
        <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Sin vuelos disponibles</h2>
        <p class="text-sm text-gray-400">No encontramos vuelos para esta ruta y fecha.</p>
      </div>

      <div class="space-y-4">
        <div *ngFor="let flight of sorted()" class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ flight.airline?.name ?? 'Aerolínea' }}</p>
                <p class="text-xs text-gray-400">{{ flight.flightNumber ?? flight.originAirportIata }}</p>
              </div>
            </div>
            <span [class]="'text-xs px-2 py-0.5 rounded-full font-medium ' + (flight.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')">
              {{ flight.status === 'SCHEDULED' ? 'A tiempo' : flight.status }}
            </span>
          </div>

          <div class="flex items-center gap-4 mb-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ depTime(flight) }}</p>
              <p class="text-xs font-semibold text-gray-500">{{ flight.route?.originAirport?.iataCode ?? flight.originAirportIata }}</p>
              <p class="text-xs text-gray-400">{{ flight.route?.originAirport?.city ?? '' }}</p>
            </div>
            <div class="flex-1 flex flex-col items-center gap-1">
              <p class="text-xs text-gray-400 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ durationStr(flight) }}
              </p>
              <div class="w-full flex items-center gap-1">
                <div class="flex-1 h-px bg-gray-300"></div>
                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </div>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ arrTime(flight) }}</p>
              <p class="text-xs font-semibold text-gray-500">{{ flight.route?.destinationAirport?.iataCode ?? flight.destinationAirportIata }}</p>
              <p class="text-xs text-gray-400">{{ flight.route?.destinationAirport?.city ?? '' }}</p>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4 space-y-2">
            <div *ngFor="let fc of flight.flightClasses ?? []" class="flex items-center justify-between">
              <div>
                <span [class]="'text-xs font-medium px-2 py-0.5 rounded ' + classColor(fc.classType)">
                  {{ classLabel(fc.classType) }}
                </span>
                <span class="text-xs text-gray-400 ml-2">{{ fc.availableSeats }} asientos</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-lg font-bold text-blue-600">\${{ (fc.basePrice * params().passengers).toFixed(2) }}</p>
                  <p *ngIf="params().passengers > 1" class="text-xs text-gray-400">\${{ fc.basePrice.toFixed(2) }} × {{ params().passengers }}</p>
                </div>
                <button (click)="reserve(fc.id)"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ResultsComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private flightsSvc = inject(FlightsService);

  loading  = signal(false);
  error    = signal<string | null>(null);
  flights  = signal<Flight[]>([]);
  sortBy   = 'departure';

  params = signal<FlightSearchParams>({ origin: '', destination: '', date: '', passengers: 1 });

  formattedDate = computed(() => {
    const d = this.params().date;
    if (!d) return '';
    try { return format(new Date(d + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es }); } catch { return d; }
  });

  sorted = computed(() => {
    const list = [...this.flights()];
    if (this.sortBy === 'price') {
      return list.sort((a, b) => {
        const aMin = Math.min(...(a.flightClasses ?? []).map(fc => fc.basePrice));
        const bMin = Math.min(...(b.flightClasses ?? []).map(fc => fc.basePrice));
        return aMin - bMin;
      });
    }
    if (this.sortBy === 'duration') {
      return list.sort((a, b) => (a.route?.estimatedDuration ?? a.duration ?? 0) - (b.route?.estimatedDuration ?? b.duration ?? 0));
    }
    return list.sort((a, b) =>
      new Date(a.departureDateTime ?? a.departureDate).getTime() - new Date(b.departureDateTime ?? b.departureDate).getTime()
    );
  });

  ngOnInit() {
    const q = this.route.snapshot.queryParams;
    this.params.set({
      origin:      q['origin'] ?? '',
      destination: q['destination'] ?? '',
      date:        q['date'] ?? '',
      passengers:  Number(q['passengers'] ?? 1),
      class:       q['class'] || undefined,
    });
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.flightsSvc.search(this.params()).subscribe({
      next: res => { this.flights.set(res.data); this.loading.set(false); },
      error: err => {
        this.error.set(err?.error?.error?.message ?? 'Error al buscar vuelos.');
        this.loading.set(false);
      },
    });
  }

  reserve(flightClassId: string) {
    this.router.navigate(['/reservations/new', flightClassId]);
  }

  depTime(f: Flight) {
    const d = f.departureDateTime ? new Date(f.departureDateTime) : null;
    return d ? format(d, 'HH:mm') : '--:--';
  }
  arrTime(f: Flight) {
    const d = f.arrivalDateTime ? new Date(f.arrivalDateTime) : null;
    return d ? format(d, 'HH:mm') : '--:--';
  }
  durationStr(f: Flight) {
    const m = f.route?.estimatedDuration ?? f.duration;
    return m ? formatDuration(m) : '';
  }
  classColor(t: string) {
    if (t === 'FIRST') return 'bg-purple-100 text-purple-700';
    if (t === 'BUSINESS') return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  }
  classLabel(t: string) {
    if (t === 'ECONOMY') return 'Económica';
    if (t === 'BUSINESS') return 'Business';
    if (t === 'FIRST') return 'Primera';
    return t;
  }
}
