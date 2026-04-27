import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirportSearchComponent } from '../../../shared/components/airport-search/airport-search.component';
import { FlightsService } from '../../../core/services/flights.service';
import type { Flight } from '../../../core/models/domain';

interface RouteCard {
  from: string;
  to: string;
  fromCity: string;
  toCity: string;
  price: number;
  date: string;
  color: string;
}

const ROUTE_COLORS = [
  'from-blue-500 to-blue-700',
  'from-indigo-500 to-purple-700',
  'from-teal-500 to-cyan-700',
  'from-orange-500 to-red-600',
  'from-emerald-500 to-lime-700',
  'from-sky-500 to-indigo-700',
];

function dateOnly(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().split('T')[0];
  return value.split('T')[0];
}

function lowestPrice(flight: Flight): number | null {
  const prices = (flight.flightClasses ?? [])
    .filter(fc => fc.availableSeats > 0)
    .map(fc => Number(fc.basePrice))
    .filter(price => Number.isFinite(price) && price > 0);

  return prices.length ? Math.min(...prices) : null;
}

function buildRecommendedRoutes(flights: Flight[]): RouteCard[] {
  const routes = new Map<string, RouteCard>();

  for (const flight of flights) {
    if (flight.status !== 'SCHEDULED' && flight.status !== 'DELAYED') continue;

    const price = lowestPrice(flight);
    if (price === null) continue;

    const from = flight.route?.originAirport?.iataCode ?? flight.originAirportIata;
    const to = flight.route?.destinationAirport?.iataCode ?? flight.destinationAirportIata;
    if (!from || !to) continue;

    const key = `${from}-${to}`;
    const route: RouteCard = {
      from,
      to,
      fromCity: flight.route?.originAirport?.city || from,
      toCity: flight.route?.destinationAirport?.city || to,
      price,
      date: dateOnly(flight.departureDate),
      color: ROUTE_COLORS[routes.size % ROUTE_COLORS.length],
    };

    const current = routes.get(key);
    if (!current || route.price < current.price) routes.set(key, route);
  }

  return [...routes.values()].sort((a, b) => a.price - b.price).slice(0, 6);
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AirportSearchComponent],
  template: `
    <div>
      <section class="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white py-20 px-4">
        <div class="max-w-5xl mx-auto text-center mb-10">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Encuentra tu proximo vuelo</h1>
          <p class="text-blue-200 text-lg">Busca por ciudad, aeropuerto o codigo IATA</p>
        </div>

        <div class="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_1fr] gap-3 items-start mb-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <svg class="inline w-3.5 h-3.5 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                Origen
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                <app-airport-search #originSearch [value]="origin()" (valueChange)="origin.set($event)" placeholder="Ciudad o aeropuerto de salida" />
              </div>
              <p *ngIf="submitted && !origin()" class="text-xs text-red-500 mt-1">Selecciona el origen</p>
            </div>

            <button type="button" (click)="swap()"
              class="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-colors mt-7 self-start">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </button>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <svg class="inline w-3.5 h-3.5 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                Destino
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                <app-airport-search #destinationSearch [value]="destination()" (valueChange)="destination.set($event)" placeholder="Ciudad o aeropuerto de llegada" />
              </div>
              <p *ngIf="submitted && !destination()" class="text-xs text-red-500 mt-1">Selecciona el destino</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Fecha de salida</label>
              <input [(ngModel)]="date" type="date" [min]="today"
                class="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-colors" />
              <p *ngIf="submitted && !date" class="text-xs text-red-500 mt-1">Selecciona la fecha</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Pasajeros</label>
              <div class="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white">
                <button type="button" (click)="changePassengers(-1)" [disabled]="passengers() <= 1"
                  class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                </button>
                <span class="w-8 text-center text-sm font-bold text-gray-900 select-none">{{ passengers() }}</span>
                <button type="button" (click)="changePassengers(1)" [disabled]="passengers() >= 9"
                  class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 disabled:opacity-40 transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </button>
                <span class="text-xs text-gray-400 ml-1 select-none">{{ passengers() === 1 ? 'adulto' : 'adultos' }}</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Clase</label>
              <select [(ngModel)]="classType"
                class="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none bg-white transition-colors">
                <option value="">Cualquier clase</option>
                <option value="ECONOMY">Economica</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">Primera clase</option>
              </select>
            </div>

            <button type="button" (click)="onSearch()"
              class="sm:ml-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-md hover:shadow-lg w-full sm:w-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
              Buscar vuelos
            </button>
          </div>

          <p *ngIf="routeError()" class="text-xs text-red-500 mt-3">{{ routeError() }}</p>
        </div>

        <div class="max-w-5xl mx-auto mt-5" *ngIf="loadingRoutes() || routes().length > 0">
          <p class="text-blue-200 text-xs font-medium mb-2">Rutas disponibles:</p>
          <div *ngIf="loadingRoutes()" class="text-xs text-blue-100">Cargando rutas desde la base...</div>
          <div *ngIf="!loadingRoutes()" class="flex flex-wrap gap-2">
            <button *ngFor="let r of routes()" type="button" (click)="quickSearch(r)"
              class="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-full transition-colors border border-white/20">
              {{ r.fromCity }} &rarr; {{ r.toCity }}
              <span class="text-blue-200 font-medium">desde &#36;{{ r.price | number:'1.0-0' }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Multiples aerolineas</h3>
          <p class="text-sm text-gray-500">Compara vuelos con las aerolineas disponibles en la base.</p>
        </div>
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Reserva segura</h3>
          <p class="text-sm text-gray-500">Tus datos y pago estan protegidos en todo momento.</p>
        </div>
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Confirmacion inmediata</h3>
          <p class="text-sm text-gray-500">Recibe tu codigo de reserva al instante.</p>
        </div>
      </section>

      <section class="bg-gradient-to-br from-slate-50 to-blue-50 py-14 px-4">
        <div class="max-w-5xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Ofertas recomendadas</h2>
              <p class="text-sm text-gray-500 mt-1">Rutas reales disponibles en la base de datos</p>
            </div>
          </div>

          <div *ngIf="loadingRoutes()" class="bg-white border border-blue-100 rounded-xl px-4 py-5 text-sm text-gray-500">
            Cargando ofertas desde la base...
          </div>

          <div *ngIf="!loadingRoutes() && routes().length === 0" class="bg-white border border-blue-100 rounded-xl px-4 py-5 text-sm text-gray-500">
            No hay vuelos con asientos disponibles para recomendar.
          </div>

          <div *ngIf="!loadingRoutes() && routes().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <button *ngFor="let r of routes()" type="button" (click)="quickSearch(r)"
              [ngClass]="'bg-gradient-to-br ' + r.color"
              class="text-white rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow-lg">
              <div class="flex items-center justify-between mb-3">
                <div class="text-center">
                  <span class="text-2xl font-black">{{ r.from }}</span>
                  <p class="text-xs opacity-70 mt-0.5">{{ r.fromCity }}</p>
                </div>
                <svg class="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                <div class="text-center">
                  <span class="text-2xl font-black">{{ r.to }}</span>
                  <p class="text-xs opacity-70 mt-0.5">{{ r.toCity }}</p>
                </div>
              </div>
              <div class="border-t border-white/20 pt-3 mt-2">
                <p class="text-xs opacity-70">desde</p>
                <p class="text-3xl font-black">&#36;{{ r.price | number:'1.0-0' }}</p>
                <p class="text-xs opacity-70 mt-0.5">por persona &middot; ida</p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  @ViewChild('originSearch') private originSearch?: AirportSearchComponent;
  @ViewChild('destinationSearch') private destinationSearch?: AirportSearchComponent;

  private router = inject(Router);
  private flightsSvc = inject(FlightsService);

  today = new Date().toISOString().split('T')[0];
  passengers = signal(1);
  routes = signal<RouteCard[]>([]);
  loadingRoutes = signal(true);
  routeError = signal('');

  origin = signal('');
  destination = signal('');
  date = this.today;
  classType = '';
  submitted = false;

  ngOnInit() {
    this.loadRecommendedRoutes();
  }

  changePassengers(delta: number) {
    this.passengers.update(v => Math.min(9, Math.max(1, v + delta)));
  }

  swap() {
    const o = this.origin();
    this.origin.set(this.destination());
    this.destination.set(o);
  }

  quickSearch(route: RouteCard) {
    const params = new URLSearchParams({
      origin: route.from,
      destination: route.to,
      date: route.date,
      passengers: '1',
    });
    this.router.navigateByUrl(`/results?${params}`);
  }

  onSearch() {
    this.submitted = true;
    this.routeError.set('');

    const origin = this.origin() || this.originSearch?.resolveCurrentValue() || '';
    const destination = this.destination() || this.destinationSearch?.resolveCurrentValue() || '';

    this.origin.set(origin);
    this.destination.set(destination);

    if (!origin || !destination || !this.date) return;
    if (origin === destination) {
      this.routeError.set('Origen y destino no pueden ser el mismo aeropuerto.');
      return;
    }

    const params = new URLSearchParams({
      origin,
      destination,
      date: this.date,
      passengers: String(this.passengers()),
      ...(this.classType ? { class: this.classType } : {}),
    });
    this.router.navigateByUrl(`/results?${params}`);
  }

  private loadRecommendedRoutes() {
    this.loadingRoutes.set(true);
    this.flightsSvc.getAll().subscribe({
      next: res => {
        this.routes.set(buildRecommendedRoutes(res.data));
        this.loadingRoutes.set(false);
      },
      error: () => {
        this.routes.set([]);
        this.loadingRoutes.set(false);
      },
    });
  }
}
