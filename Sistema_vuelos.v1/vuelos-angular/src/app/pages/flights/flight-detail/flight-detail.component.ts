import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlightsService } from '../../../core/services/flights.service';
import type { Flight } from '../../../core/models/domain';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-flight-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <button (click)="router.navigate(['/results'])" class="text-sm text-blue-600 hover:underline mb-6 flex items-center gap-1">
        ← Volver a resultados
      </button>

      <div *ngIf="loading()" class="flex justify-center py-20">
        <svg class="w-7 h-7 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <div *ngIf="!loading() && flight() as f" class="space-y-5">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ f.route?.originAirport?.iataCode ?? f.originAirportIata }} →
          {{ f.route?.destinationAirport?.iataCode ?? f.destinationAirportIata }}
        </h1>

        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            <p class="font-semibold text-gray-800">{{ f.airline?.name ?? 'Aerolínea' }} · {{ f.flightNumber ?? '' }}</p>
          </div>
          <div class="flex items-center gap-6 mb-4">
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ depTime(f) }}</p>
              <p class="text-xs font-bold text-gray-500">{{ f.route?.originAirport?.iataCode ?? f.originAirportIata }}</p>
              <p class="text-xs text-gray-400">{{ f.route?.originAirport?.city ?? '' }}</p>
            </div>
            <div class="flex-1 flex items-center gap-1">
              <div class="flex-1 h-px bg-gray-200"></div>
              <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-gray-900">{{ arrTime(f) }}</p>
              <p class="text-xs font-bold text-gray-500">{{ f.route?.destinationAirport?.iataCode ?? f.destinationAirportIata }}</p>
              <p class="text-xs text-gray-400">{{ f.route?.destinationAirport?.city ?? '' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="font-semibold text-gray-800 mb-4">Clases disponibles</h2>
          <div class="space-y-3">
            <div *ngFor="let fc of f.flightClasses ?? []" class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <span class="text-sm font-medium text-gray-800">{{ classLabel(fc.classType) }}</span>
                <p class="text-xs text-gray-400">{{ fc.availableSeats }} asientos disponibles</p>
              </div>
              <div class="flex items-center gap-4">
                <p class="text-xl font-bold text-blue-600">\${{ fc.basePrice.toFixed(2) }}</p>
                <button (click)="router.navigate(['/reservations/new', fc.id])"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
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
export class FlightDetailComponent implements OnInit {
  route  = inject(ActivatedRoute);
  router = inject(Router);
  private flightsSvc = inject(FlightsService);

  loading = signal(true);
  flight  = signal<Flight | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.flightsSvc.getById(id).subscribe({
      next: res => { this.flight.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  depTime(f: Flight) {
    return f.departureDateTime ? format(new Date(f.departureDateTime), 'HH:mm') : '--:--';
  }
  arrTime(f: Flight) {
    return f.arrivalDateTime ? format(new Date(f.arrivalDateTime), 'HH:mm') : '--:--';
  }
  classLabel(t: string) {
    if (t === 'ECONOMY') return 'Económica';
    if (t === 'BUSINESS') return 'Business';
    if (t === 'FIRST') return 'Primera clase';
    return t;
  }
}
