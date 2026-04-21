import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirportSearchComponent } from '../../../shared/components/airport-search/airport-search.component';

const POPULAR_ROUTES = [
  { from: 'UIO', to: 'GYE', fromCity: 'Quito',     toCity: 'Guayaquil', price: 89,  color: 'from-blue-500 to-blue-700' },
  { from: 'UIO', to: 'BOG', fromCity: 'Quito',     toCity: 'Bogotá',    price: 145, color: 'from-indigo-500 to-purple-700' },
  { from: 'GYE', to: 'LIM', fromCity: 'Guayaquil', toCity: 'Lima',      price: 198, color: 'from-teal-500 to-cyan-700' },
  { from: 'UIO', to: 'MIA', fromCity: 'Quito',     toCity: 'Miami',     price: 350, color: 'from-orange-500 to-red-600' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AirportSearchComponent],
  template: `
    <div>
      <!-- Hero -->
      <section class="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white py-20 px-4">
        <div class="max-w-5xl mx-auto text-center mb-10">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Encuentra tu próximo vuelo</h1>
          <p class="text-blue-200 text-lg">Busca por ciudad, aeropuerto o código IATA</p>
        </div>

        <!-- Search Card -->
        <div class="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-2xl">
          <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_1fr] gap-3 items-start mb-4">

            <!-- Origen -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <svg class="inline w-3.5 h-3.5 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                Origen
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                <app-airport-search [value]="origin()" (valueChange)="origin.set($event)" placeholder="Ciudad o aeropuerto de salida" />
              </div>
              <p *ngIf="submitted && !origin()" class="text-xs text-red-500 mt-1">Selecciona el origen</p>
            </div>

            <!-- Swap -->
            <button type="button" (click)="swap()"
              class="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-colors mt-7 self-start">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            </button>

            <!-- Destino -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                <svg class="inline w-3.5 h-3.5 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                Destino
              </label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                <app-airport-search [value]="destination()" (valueChange)="destination.set($event)" placeholder="Ciudad o aeropuerto de llegada" />
              </div>
              <p *ngIf="submitted && !destination()" class="text-xs text-red-500 mt-1">Selecciona el destino</p>
            </div>

            <!-- Fecha -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Fecha de salida</label>
              <input [(ngModel)]="date" type="date" [min]="today"
                class="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-colors" />
              <p *ngIf="submitted && !date" class="text-xs text-red-500 mt-1">Selecciona la fecha</p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <!-- Pasajeros -->
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

            <!-- Clase -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Clase</label>
              <select [(ngModel)]="classType"
                class="border-2 border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none bg-white transition-colors">
                <option value="">Cualquier clase</option>
                <option value="ECONOMY">Económica</option>
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
        </div>

        <!-- Rutas rápidas -->
        <div class="max-w-5xl mx-auto mt-5">
          <p class="text-blue-200 text-xs font-medium mb-2">Rutas populares:</p>
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let r of routes" type="button" (click)="quickSearch(r.from, r.to)"
              class="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs px-3 py-1.5 rounded-full transition-colors border border-white/20">
              {{ r.fromCity }} → {{ r.toCity }}
              <span class="text-blue-200 font-medium">desde &#36;{{ r.price }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="max-w-5xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Múltiples aerolíneas</h3>
          <p class="text-sm text-gray-500">Compara vuelos de Avianca, LATAM, American Airlines y más.</p>
        </div>
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Reserva segura</h3>
          <p class="text-sm text-gray-500">Tus datos y pago están protegidos en todo momento.</p>
        </div>
        <div class="text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">Confirmación inmediata</h3>
          <p class="text-sm text-gray-500">Recibe tu código de reserva al instante.</p>
        </div>
      </section>

      <!-- Ofertas recomendadas -->
      <section class="bg-gradient-to-br from-slate-50 to-blue-50 py-14 px-4">
        <div class="max-w-5xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Ofertas recomendadas</h2>
              <p class="text-sm text-gray-500 mt-1">Las mejores rutas al mejor precio</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <button *ngFor="let r of routes" type="button" (click)="quickSearch(r.from, r.to)"
              class="bg-gradient-to-br {{r.color}} text-white rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow-lg">
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
                <p class="text-3xl font-black">&#36;{{ r.price }}</p>
                <p class="text-xs opacity-70 mt-0.5">por persona · ida</p>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent {
  private router = inject(Router);

  today     = new Date().toISOString().split('T')[0];
  passengers = signal(1);
  routes     = POPULAR_ROUTES;

  origin      = signal('');
  destination = signal('');
  date        = this.today;
  classType   = '';
  submitted   = false;

  changePassengers(delta: number) {
    this.passengers.update(v => Math.min(9, Math.max(1, v + delta)));
  }

  swap() {
    const o = this.origin();
    this.origin.set(this.destination());
    this.destination.set(o);
  }

  quickSearch(from: string, to: string) {
    const params = new URLSearchParams({ origin: from, destination: to, date: this.today, passengers: '1' });
    this.router.navigateByUrl(`/results?${params}`);
  }

  onSearch() {
    this.submitted = true;
    if (!this.origin() || !this.destination() || !this.date) return;
    const params = new URLSearchParams({
      origin:     this.origin(),
      destination: this.destination(),
      date:        this.date,
      passengers:  String(this.passengers()),
      ...(this.classType ? { class: this.classType } : {}),
    });
    this.router.navigateByUrl(`/results?${params}`);
  }
}
