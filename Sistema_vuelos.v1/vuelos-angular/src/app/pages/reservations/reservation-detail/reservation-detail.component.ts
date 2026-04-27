import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReservationsService } from '../../../core/services/reservations.service';
import { BoardingPassesService } from '../../../core/services/boarding-passes.service';
import { PassengerServicesService } from '../../../core/services/passenger-services.service';
import { AirlineServiceConfigsService } from '../../../core/services/airline-service-configs.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { InvoicesService } from '../../../core/services/invoices.service';
import type { Reservation, Passenger, BoardingPass, PassengerService, AirlineServiceConfig, Payment, Invoice } from '../../../core/models/domain';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-700',    COMPLETED: 'bg-gray-100 text-gray-600',
};
const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmada', PENDING: 'Pendiente', CANCELLED: 'Cancelada', COMPLETED: 'Completada',
};
const CHECKIN_LABELS: Record<string, { label: string; color: string }> = {
  NOT_CHECKED_IN: { label: 'Sin check-in',  color: 'text-gray-500 bg-gray-100' },
  CHECKED_IN:     { label: 'Check-in OK',   color: 'text-green-700 bg-green-100' },
  BOARDED:        { label: 'Embarcado',     color: 'text-blue-700 bg-blue-100' },
  NO_SHOW:        { label: 'No se presentó',color: 'text-red-700 bg-red-100' },
};
const SERVICE_CAT_LABELS: Record<string, string> = {
  BAGGAGE: 'Equipaje', SEAT: 'Asiento', MEAL: 'Comida',
  ENTERTAINMENT: 'Entretenimiento', LOUNGE: 'Sala VIP',
  INSURANCE: 'Seguro', TRANSPORT: 'Transporte', OTRO: 'Otro',
};
const SEAT_ROWS = [1, 2, 3, 4, 5, 6, 12, 14, 15, 16, 17, 18, 19, 20];
const SEAT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEAT_OPTIONS = SEAT_ROWS.flatMap(row => SEAT_LETTERS.map(letter => `${row}${letter}`));
const EXTRA_PAYMENT_METHODS = [
  { value: 'CARD', label: 'Tarjeta', hint: 'Visa o Mastercard' },
  { value: 'PAYPAL', label: 'PayPal', hint: 'Cuenta verificada' },
  { value: 'TRANSFER', label: 'Transferencia', hint: 'Referencia bancaria' },
];

function generateBoardingCode(passengerId: string) {
  return `BP-${passengerId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function generateExtraTxId() {
  return `EXT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

interface PassengerState {
  passenger: Passenger;
  expanded: boolean;
  boardingPasses: BoardingPass[];
  passengerServices: PassengerService[];
  checkingIn: boolean;
  addingService: boolean;
  selectedConfig: string;
  seatInput: string;
  loadingBP: boolean;
  loadingServices: boolean;
}

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <button (click)="router.navigate(['/my-trips'])" class="text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Mis viajes
      </button>

      <div *ngIf="loading()" class="flex justify-center py-32">
        <svg class="w-7 h-7 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
      </div>

      <ng-container *ngIf="!loading() && reservation() as r">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-xl font-bold text-gray-900">Reserva #{{ r.reservationCode }}</h1>
            <p class="text-sm text-gray-400 mt-0.5">Creada el {{ createdDate(r) }}</p>
          </div>
          <span [class]="'text-sm font-medium px-3 py-1 rounded-full ' + statusStyle(r.status)">{{ statusLabel(r.status) }}</span>
        </div>

        <!-- Vuelo -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            <p class="font-semibold text-gray-800">{{ r.flight?.airline?.name ?? 'Aerolínea' }}</p>
          </div>
          <div class="flex items-center gap-4">
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ depTime(r) }}</p>
              <p class="text-xs font-bold text-gray-500">{{ r.flight?.route?.originAirport?.iataCode ?? r.flight?.originAirportIata }}</p>
            </div>
            <div class="flex-1 flex items-center gap-1">
              <div class="flex-1 h-px bg-gray-200"></div>
              <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-gray-900">{{ arrTime(r) }}</p>
              <p class="text-xs font-bold text-gray-500">{{ r.flight?.route?.destinationAirport?.iataCode ?? r.flight?.destinationAirportIata }}</p>
            </div>
          </div>
        </div>

        <!-- Pasajeros -->
        <div class="space-y-3">
          <h2 class="font-semibold text-gray-800 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Pasajeros ({{ passengerStates().length }})
          </h2>

          <div *ngFor="let ps of passengerStates(); let i = index" class="border border-gray-200 rounded-xl overflow-hidden">
            <button type="button" (click)="togglePassenger(i)"
              class="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div class="text-left">
                  <p class="font-semibold text-gray-900 text-sm">{{ ps.passenger.firstName }} {{ ps.passenger.lastName }}</p>
                  <p class="text-xs text-gray-400">Doc: {{ ps.passenger.documentNumber }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span [class]="'text-xs font-semibold px-2.5 py-1 rounded-full ' + checkInColor(ps)">{{ checkInLabel(ps) }}</span>
                <svg [class]="'w-4 h-4 text-gray-400 transition-transform ' + (ps.expanded ? 'rotate-180' : '')" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </button>

            <div *ngIf="ps.expanded" class="bg-gray-50 border-t border-gray-200 px-5 py-4 space-y-5">
              <!-- Check-in -->
              <div>
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Check-in</h4>
                <div *ngIf="ps.loadingBP" class="flex justify-center py-2">
                  <svg class="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </div>
                <ng-container *ngIf="!ps.loadingBP">
                  <div *ngIf="ps.boardingPasses[0] as bp" class="bg-white border border-green-200 rounded-xl p-4 space-y-3">
                    <div class="flex items-center gap-4">
                      <svg class="w-8 h-8 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <div>
                        <p class="font-semibold text-gray-800 text-sm">Check-in realizado</p>
                        <p class="text-xs text-gray-500 font-mono mt-1">{{ bp.boardingCode }}</p>
                      </div>
                    </div>
                    <!-- Asiento asignado o selector de asiento -->
                    <div class="border-t border-gray-100 pt-3">
                      <p class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Asiento</p>
                      <div *ngIf="ps.passenger.seatNumber" class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-semibold text-blue-700 font-mono">{{ ps.passenger.seatNumber }}</p>
                          <p class="text-xs text-gray-400">{{ seatLabel(ps.passenger.seatNumber) }}</p>
                        </div>
                        <span *ngIf="seatPrice(ps.passenger.seatNumber) > 0" class="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                          +\${{ seatPrice(ps.passenger.seatNumber).toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ng-container *ngIf="!ps.boardingPasses[0] && canEdit()">
                    <div *ngIf="ps.checkingIn" class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <p class="text-sm font-semibold text-gray-800">Seleccion de asiento</p>
                          <p class="text-xs text-gray-500 mt-1">Elige un asiento o usa asignacion automatica sin costo.</p>
                        </div>
                        <button type="button" (click)="autoAssignSeat(i)"
                          class="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
                          Automatico gratis
                        </button>
                      </div>

                      <div class="relative mx-auto max-w-[32rem] px-7 sm:px-12">
                        <div class="relative mx-10 h-20 rounded-t-[100px] border-x border-t border-blue-100 bg-gradient-to-b from-sky-100 via-white to-white shadow-sm">
                          <div class="absolute left-1/2 top-4 grid -translate-x-1/2 grid-cols-2 gap-2">
                            <span class="block h-4 w-9 rounded-t-full bg-blue-200/80 border border-blue-300"></span>
                            <span class="block h-4 w-9 rounded-t-full bg-blue-200/80 border border-blue-300"></span>
                          </div>
                          <span class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wide text-blue-500">Frente del avion</span>
                        </div>

                        <div class="relative">
                          <div class="hidden sm:flex absolute -left-10 top-[17.5rem] h-60 w-20 rounded-l-[90%] bg-gradient-to-r from-sky-200 to-sky-50 border border-blue-100 items-center justify-center">
                            <span class="-rotate-90 text-[11px] font-bold tracking-wider text-sky-700">ALA IZQ.</span>
                          </div>
                          <div class="hidden sm:flex absolute -right-10 top-[17.5rem] h-60 w-20 rounded-r-[90%] bg-gradient-to-l from-sky-200 to-sky-50 border border-blue-100 items-center justify-center">
                            <span class="rotate-90 text-[11px] font-bold tracking-wider text-sky-700">ALA DER.</span>
                          </div>
                          <span class="hidden sm:flex absolute -left-10 top-[24.5rem] -rotate-90 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold tracking-wider text-orange-600 border border-orange-200">SALIDA</span>
                          <span class="hidden sm:flex absolute -right-10 top-[24.5rem] rotate-90 rounded-full bg-orange-50 px-2 py-1 text-[10px] font-bold tracking-wider text-orange-600 border border-orange-200">SALIDA</span>

                          <div class="relative mx-auto rounded-b-[54px] border-x border-b border-blue-100 bg-white px-4 pb-6 pt-4 shadow-inner">
                            <div class="mb-3 grid grid-cols-[1fr_2.5rem_1fr] items-center gap-2 text-center">
                              <span class="rounded-lg border border-gray-200 bg-gray-50 py-1 text-[10px] font-bold text-gray-500">WC</span>
                              <span class="text-[10px] font-bold uppercase text-gray-300">Pasillo</span>
                              <span class="rounded-lg border border-gray-200 bg-gray-50 py-1 text-[10px] font-bold text-gray-500">WC</span>
                            </div>
                            <div class="mb-3 grid grid-cols-[1fr_2.5rem_1fr] gap-2 text-center">
                              <div class="grid grid-cols-3 gap-1 text-[10px] font-bold text-gray-400">
                                <span *ngFor="let letter of leftSeatLetters">{{ letter }}</span>
                              </div>
                              <span class="text-[10px] font-bold text-gray-300">Fila</span>
                              <div class="grid grid-cols-3 gap-1 text-[10px] font-bold text-gray-400">
                                <span *ngFor="let letter of rightSeatLetters">{{ letter }}</span>
                              </div>
                            </div>

                            <div class="space-y-1">
                              <ng-container *ngFor="let row of seatRows">
                                <div *ngIf="isExitRow(row)" class="grid grid-cols-[1fr_2.5rem_1fr] items-center gap-2 py-1 text-center">
                                  <span class="h-px bg-orange-200"></span>
                                  <span class="rounded-full bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-600 border border-orange-200">EXIT</span>
                                  <span class="h-px bg-orange-200"></span>
                                </div>
                              <div class="grid grid-cols-[1fr_2.5rem_1fr] items-center gap-2 text-center">
                                <div class="relative grid grid-cols-3 gap-1">
                                  <span *ngIf="isExitRow(row)" class="absolute -left-7 top-1/2 -translate-y-1/2 rounded bg-orange-50 px-1 text-[9px] font-bold text-orange-600 sm:hidden">EXIT</span>
                                  <button *ngFor="let letter of leftSeatLetters" type="button"
                                    (click)="selectSeat(i, row + letter)"
                                    [class]="seatButtonClass(ps, row + letter)">
                                    <span class="block h-1 w-5 rounded-full bg-current opacity-30 mb-0.5"></span>
                                    <span>{{ row }}{{ letter }}</span>
                                  </button>
                                </div>

                                <span [class]="rowMarkerClass(row)">{{ row }}</span>

                                <div class="relative grid grid-cols-3 gap-1">
                                  <button *ngFor="let letter of rightSeatLetters" type="button"
                                    (click)="selectSeat(i, row + letter)"
                                    [class]="seatButtonClass(ps, row + letter)">
                                    <span class="block h-1 w-5 rounded-full bg-current opacity-30 mb-0.5"></span>
                                    <span>{{ row }}{{ letter }}</span>
                                  </button>
                                  <span *ngIf="isExitRow(row)" class="absolute -right-7 top-1/2 -translate-y-1/2 rounded bg-orange-50 px-1 text-[9px] font-bold text-orange-600 sm:hidden">EXIT</span>
                                </div>
                              </div>
                              </ng-container>
                            </div>

                            <div class="mt-3 grid grid-cols-3 gap-2 text-[10px] font-semibold text-gray-500">
                              <span class="flex items-center justify-center gap-1"><i class="h-2.5 w-2.5 rounded bg-white border border-gray-300"></i>Libre</span>
                              <span class="flex items-center justify-center gap-1"><i class="h-2.5 w-2.5 rounded bg-amber-100 border border-amber-300"></i>Premium</span>
                              <span class="flex items-center justify-center gap-1"><i class="h-2.5 w-2.5 rounded bg-blue-600"></i>Elegido</span>
                            </div>
                            <div class="mt-3 grid grid-cols-[1fr_2.5rem_1fr] items-center gap-2 text-center">
                              <span class="rounded-lg border border-gray-200 bg-gray-50 py-1 text-[10px] font-bold text-gray-500">WC</span>
                              <span class="text-[10px] font-bold uppercase text-gray-300">Cola</span>
                              <span class="rounded-lg border border-gray-200 bg-gray-50 py-1 text-[10px] font-bold text-gray-500">WC</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2">
                        <span class="text-xs text-blue-900">
                          {{ ps.seatInput ? ('Asiento ' + ps.seatInput + ' - ' + seatLabel(ps.seatInput)) : 'Asiento automatico sin costo al confirmar' }}
                        </span>
                        <span class="text-xs font-bold text-blue-700">
                          {{ ps.seatInput ? ('+$' + seatPrice(ps.seatInput).toFixed(2)) : '$0.00' }}
                        </span>
                      </div>
                      <div class="flex gap-2">
                        <button (click)="doCheckIn(i)"
                          class="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                          Confirmar check-in
                        </button>
                        <button (click)="updatePS(i, {checkingIn: false, seatInput: ''})"
                          class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors">
                          Cancelar
                        </button>
                      </div>
                    </div>
                    <button *ngIf="!ps.checkingIn" (click)="updatePS(i, {checkingIn: true})"
                      class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                      Hacer check-in
                    </button>
                  </ng-container>
                </ng-container>
              </div>

              <!-- Servicios -->
              <div>
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>Servicios adicionales</span>
                  <button *ngIf="canEdit() && !ps.addingService" (click)="updatePS(i, {addingService: true})"
                    class="text-blue-600 hover:text-blue-700 flex items-center gap-0.5 font-semibold normal-case tracking-normal text-xs">
                    + Agregar
                  </button>
                </h4>
                <div *ngIf="ps.loadingServices" class="flex justify-center py-3">
                  <svg class="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                </div>
                <p *ngIf="!ps.loadingServices && ps.passengerServices.length === 0 && !ps.addingService" class="text-xs text-gray-400 italic">Sin servicios adicionales.</p>
                <div *ngFor="let svc of ps.passengerServices" class="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-3 py-2 mb-2">
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ svc.serviceConfig?.service?.name ?? 'Servicio' }}</p>
                    <p class="text-xs text-gray-400">{{ catLabel(svc.serviceConfig?.service?.category) }} · x{{ svc.quantity }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span *ngIf="svc.quantity && svc.unitPriceAtBooking" class="text-xs font-semibold text-gray-700">\${{ (svc.quantity * (+svc.unitPriceAtBooking)).toFixed(2) }}</span>
                    <button *ngIf="canEdit()" (click)="removeService(i, svc.id)"
                      class="text-gray-300 hover:text-red-500 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>

                <div *ngIf="ps.addingService" class="bg-white border border-blue-200 rounded-lg p-3 space-y-2">
                  <select [ngModel]="ps.selectedConfig" (ngModelChange)="selectServiceConfig(i, $event)"
                    [disabled]="serviceConfigsLoading() || serviceConfigs().length === 0"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400">
                    <option [ngValue]="''">Selecciona un servicio...</option>
                    <option *ngIf="serviceConfigsLoading()" value="" disabled>Cargando servicios...</option>
                    <option *ngIf="!serviceConfigsLoading() && serviceConfigs().length === 0" value="" disabled>No hay servicios disponibles</option>
                    <option *ngFor="let c of serviceConfigs()" [ngValue]="c.id">
                      {{ catLabel(c.service?.category) }} — {{ c.service?.name ?? c.id }} (\${{ c.price }} {{ c.currency }})
                    </option>
                  </select>
                  <div *ngIf="selectedServiceConfig(ps) as selected"
                    class="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-sm font-semibold text-blue-950 truncate">{{ selected.service?.name ?? 'Servicio adicional' }}</p>
                      <p class="text-xs text-blue-700">{{ catLabel(selected.service?.category) }} - {{ selected.currency }}</p>
                    </div>
                    <span class="text-sm font-bold text-blue-700">\${{ (+selected.price).toFixed(2) }}</span>
                  </div>
                  <p *ngIf="serviceConfigsError()" class="text-xs text-red-500">{{ serviceConfigsError() }}</p>
                  <div class="flex gap-2">
                    <button (click)="addService(i)" [disabled]="!ps.selectedConfig"
                      class="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition-colors disabled:opacity-60">
                      Agregar servicio
                    </button>
                    <button (click)="updatePS(i, {addingService: false, selectedConfig: ''})"
                      class="px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Factura / Resumen de pago -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Factura
          </h2>
          <ng-container *ngIf="invoice() as inv">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-500">
                <span>N° Factura</span>
                <span class="font-mono font-semibold text-gray-800">{{ inv.invoiceNumber }}</span>
              </div>
              <div *ngIf="payment() as p" class="flex justify-between text-gray-500">
                <span>Método de pago</span>
                <span class="font-medium text-gray-700">{{ p.provider }}</span>
              </div>
              <div class="flex justify-between text-gray-500 pt-2 border-t border-gray-100">
                <span>Subtotal</span>
                <span>\${{ (+inv.subtotal).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>IVA 15%</span>
                <span>\${{ (+inv.taxAmount).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-semibold text-gray-800 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span class="text-blue-600">\${{ (+inv.total).toFixed(2) }}</span>
              </div>
            </div>
          </ng-container>
          <ng-container *ngIf="!invoice()">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-gray-800">Total pagado</span>
              <span class="text-2xl font-bold text-blue-600">\${{ (+r.totalAmount).toFixed(2) }}</span>
            </div>
            <p *ngIf="payment()" class="text-xs text-gray-400 mt-2">Factura en proceso de generacion...</p>
          </ng-container>
          <div *ngIf="pendingExtrasTotal() > 0" class="mt-4 pt-4 border-t border-gray-100 space-y-3">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-500">
                <span>Servicios adicionales</span>
                <span>\${{ serviceExtrasTotal().toFixed(2) }}</span>
              </div>
              <div *ngIf="seatFeesTotal() > 0" class="flex justify-between text-gray-500">
                <span>Extra de asientos</span>
                <span>\${{ seatFeesTotal().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-semibold text-gray-800 pt-2 border-t border-gray-100">
                <span>Checkout de extras</span>
                <span class="text-amber-600">\${{ pendingExtrasTotal().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between font-bold text-gray-900">
                <span>Total con extras</span>
                <span class="text-blue-600">\${{ grandTotal().toFixed(2) }}</span>
              </div>
            </div>
            <button type="button" (click)="toggleCheckout()"
              class="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              {{ checkoutOpen() ? 'Ocultar checkout' : 'Continuar checkout de extras' }}
            </button>
            <div *ngIf="checkoutOpen()" class="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 space-y-4 shadow-sm">
              <div *ngIf="extrasPaymentRef(); else extrasCheckoutFormTpl" class="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                <div class="flex items-start gap-3">
                  <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <div>
                    <p class="font-semibold">Pago de extras aprobado</p>
                    <p class="text-xs mt-1">Comprobante simulado: <span class="font-mono">{{ extrasPaymentRef() }}</span></p>
                    <p class="text-xs mt-1">Total extras: <strong>\${{ pendingExtrasTotal().toFixed(2) }}</strong></p>
                  </div>
                </div>
              </div>

              <ng-template #extrasCheckoutFormTpl>
                <form [formGroup]="extrasCheckoutForm" (ngSubmit)="submitExtrasCheckout()" class="space-y-4">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold text-gray-900">Checkout de extras</p>
                      <p class="text-xs text-gray-500 mt-1">Paga servicios y asientos sin modificar el boleto base.</p>
                    </div>
                    <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">\${{ pendingExtrasTotal().toFixed(2) }}</span>
                  </div>

                  <div class="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                    <div *ngFor="let item of extraCheckoutItems()" class="flex items-center justify-between gap-3 rounded-lg bg-white border border-gray-100 px-3 py-2">
                      <div class="min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate">{{ item.title }}</p>
                        <p class="text-xs text-gray-400 truncate">{{ item.subtitle }}</p>
                      </div>
                      <span class="text-sm font-bold text-gray-800">\${{ item.amount.toFixed(2) }}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-2 text-xs text-gray-500">
                      <div class="flex justify-between"><span>Subtotal</span><span>\${{ extrasSubtotal().toFixed(2) }}</span></div>
                      <div class="flex justify-between"><span>IVA 15%</span><span>\${{ extrasTaxAmount().toFixed(2) }}</span></div>
                    </div>
                  </div>

                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Metodo de pago</p>
                    <div class="grid grid-cols-3 gap-2">
                      <label *ngFor="let method of extraPaymentMethods" class="cursor-pointer">
                        <input type="radio" formControlName="provider" [value]="method.value" class="sr-only peer" />
                        <div class="h-full rounded-xl border-2 border-gray-200 px-3 py-2 text-center transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-50">
                          <p class="text-xs font-bold text-gray-800">{{ method.label }}</p>
                          <p class="text-[10px] text-gray-400 mt-0.5">{{ method.hint }}</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Nombre / razon social</label>
                      <input formControlName="payerName" placeholder="Juan Cevallos"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">RUC / cedula</label>
                      <input formControlName="taxId" placeholder="0912345678"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Correo de comprobante</label>
                      <input formControlName="email" type="email" placeholder="cliente@email.com"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Direccion de facturacion</label>
                      <input formControlName="billingAddress" placeholder="Av. Principal y Calle 10"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <div *ngIf="extrasCheckoutForm.value.provider === 'CARD'" class="rounded-xl border border-blue-100 bg-blue-50 p-3 space-y-3">
                    <div class="grid grid-cols-3 gap-2">
                      <label *ngFor="let brand of ['VISA', 'MASTERCARD', 'AMEX']" class="cursor-pointer">
                        <input type="radio" formControlName="cardBrand" [value]="brand" class="sr-only peer" />
                        <div class="rounded-lg border border-blue-100 bg-white py-2 text-center text-xs font-bold text-gray-600 peer-checked:border-blue-500 peer-checked:text-blue-700">{{ brand }}</div>
                      </label>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Nombre en tarjeta</label>
                      <input formControlName="cardholderName" placeholder="JUAN CEVALLOS"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Numero de tarjeta</label>
                      <input formControlName="cardNumber" [value]="extrasCardDisplay" (input)="onExtrasCardInput($event)" placeholder="4111 1111 1111 1111"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <input formControlName="expiry" placeholder="MM/AA" maxlength="5" (input)="onExtrasExpiryInput($event)"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input formControlName="cvv" type="password" placeholder="CVV" maxlength="4"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <div *ngIf="extrasCheckoutForm.value.provider === 'PAYPAL'" class="rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Correo PayPal</label>
                    <input formControlName="paypalEmail" type="email" placeholder="paypal@email.com"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div *ngIf="extrasCheckoutForm.value.provider === 'TRANSFER'" class="rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <label class="block text-xs font-medium text-gray-500 mb-1">Referencia bancaria</label>
                    <input formControlName="bankReference" placeholder="TRF-2026-000123"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
                  </div>

                  <p *ngIf="extrasCheckoutError()" class="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{{ extrasCheckoutError() }}</p>

                  <button type="submit" [disabled]="extrasPayLoading()"
                    class="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold py-3 rounded-lg transition-colors">
                    <svg *ngIf="extrasPayLoading()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    {{ extrasPayLoading() ? 'Procesando extras...' : 'Pagar extras ahora' }}
                  </button>
                  <p class="text-[11px] text-gray-400 text-center">Simulacion local hasta habilitar cargos parciales en backend.</p>
                </form>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Cancelar -->
        <button *ngIf="canEdit()" (click)="cancel(r.id)" [disabled]="cancelling()"
          class="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50">
          <svg *ngIf="cancelling()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          {{ cancelling() ? 'Cancelando...' : 'Cancelar reserva' }}
        </button>
      </ng-container>
    </div>
  `,
})
export class ReservationDetailComponent implements OnInit {
  route  = inject(ActivatedRoute);
  router = inject(Router);
  private resSvc     = inject(ReservationsService);
  private bpSvc      = inject(BoardingPassesService);
  private psSvc      = inject(PassengerServicesService);
  private ascSvc     = inject(AirlineServiceConfigsService);
  private paymentSvc = inject(PaymentsService);
  private invoiceSvc = inject(InvoicesService);
  private fb         = inject(FormBuilder);

  loading         = signal(true);
  cancelling      = signal(false);
  reservation     = signal<Reservation | null>(null);
  passengerStates = signal<PassengerState[]>([]);
  serviceConfigs  = signal<AirlineServiceConfig[]>([]);
  serviceConfigsLoading = signal(false);
  serviceConfigsError   = signal('');
  checkoutOpen          = signal(false);
  extrasPayLoading      = signal(false);
  extrasCheckoutError   = signal('');
  extrasPaymentRef      = signal('');
  payment         = signal<Payment | null>(null);
  invoice         = signal<Invoice | null>(null);
  seatRows = SEAT_ROWS;
  leftSeatLetters = SEAT_LETTERS.slice(0, 3);
  rightSeatLetters = SEAT_LETTERS.slice(3);
  extraPaymentMethods = EXTRA_PAYMENT_METHODS;
  extrasCardDisplay = '';
  extrasCheckoutForm = this.fb.group({
    provider: ['CARD', Validators.required],
    cardBrand: ['VISA'],
    cardholderName: [''],
    cardNumber: [''],
    expiry: [''],
    cvv: [''],
    payerName: ['', Validators.required],
    taxId: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    billingAddress: ['', Validators.required],
    paypalEmail: [''],
    bankReference: [''],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.resSvc.getById(id).subscribe({
      next: res => {
        this.reservation.set(res.data);
        this.loading.set(false);
        const passengers = res.data.passengers ?? [];
        this.passengerStates.set(passengers.map(p => ({
          passenger: p, expanded: false, boardingPasses: [], passengerServices: [],
          checkingIn: false, addingService: false, selectedConfig: '', seatInput: '',
          loadingBP: false, loadingServices: false,
        })));
        this.loadServiceConfigs(res.data);
        this.paymentSvc.byReservation(id).subscribe({
          next: pr => {
            const payments = pr.data as any[];
            if (payments.length > 0) {
              const p = payments[0];
              this.payment.set(p);
              this.invoiceSvc.byPayment(p.id).subscribe({
                next: ir => this.invoice.set(ir.data),
                error: () => {},
              });
            }
          },
          error: () => {},
        });
      },
      error: () => this.loading.set(false),
    });
  }

  private loadServiceConfigs(reservation: Reservation) {
    this.serviceConfigsLoading.set(true);
    this.serviceConfigsError.set('');

    const firstSegment = reservation.flight?.segments?.[0];
    const airlineId = firstSegment?.airline?.id ?? reservation.flight?.airline?.id;
    const originAirportId = firstSegment?.originAirport?.id ?? reservation.flight?.route?.originAirport?.id;
    const destAirportId = firstSegment?.destinationAirport?.id ?? reservation.flight?.route?.destinationAirport?.id;
    const request = airlineId
      ? this.ascSvc.byAirline(airlineId, originAirportId, destAirportId)
      : this.ascSvc.list();

    request.subscribe({
      next: res => {
        this.serviceConfigs.set(this.filterConfigsForRoute(res.data, originAirportId, destAirportId));
        this.serviceConfigsLoading.set(false);
      },
      error: () => {
        this.serviceConfigs.set([]);
        this.serviceConfigsError.set('No se pudieron cargar servicios para este vuelo.');
        this.serviceConfigsLoading.set(false);
      },
    });
  }

  private filterConfigsForRoute(configs: AirlineServiceConfig[], originAirportId?: string | null, destAirportId?: string | null) {
    return configs.filter(config => {
      const originMatches = !config.originAirportId || !originAirportId || config.originAirportId === originAirportId;
      const destMatches = !config.destAirportId || !destAirportId || config.destAirportId === destAirportId;
      return originMatches && destMatches;
    });
  }

  canEdit() {
    const s = this.reservation()?.status;
    return s === 'CONFIRMED' || s === 'PENDING';
  }

  togglePassenger(i: number) {
    const states = [...this.passengerStates()];
    const ps     = { ...states[i], expanded: !states[i].expanded };
    if (ps.expanded && !ps.loadingBP && ps.passenger.id) {
      ps.loadingBP      = true;
      ps.loadingServices= true;
      states[i] = ps;
      this.passengerStates.set(states);
      const passId = ps.passenger.id!;
      this.bpSvc.byPassenger(passId).subscribe({
        next: r => {
          const s2 = [...this.passengerStates()];
          s2[i] = { ...s2[i], boardingPasses: r.data, loadingBP: false };
          this.passengerStates.set(s2);
        },
        error: () => {
          const s2 = [...this.passengerStates()]; s2[i] = { ...s2[i], loadingBP: false }; this.passengerStates.set(s2);
        },
      });
      this.psSvc.byPassenger(passId).subscribe({
        next: r => {
          const s2 = [...this.passengerStates()];
          s2[i] = { ...s2[i], passengerServices: r.data, loadingServices: false };
          this.passengerStates.set(s2);
        },
        error: () => {
          const s2 = [...this.passengerStates()]; s2[i] = { ...s2[i], loadingServices: false }; this.passengerStates.set(s2);
        },
      });
    } else {
      states[i] = ps;
      this.passengerStates.set(states);
    }
  }

  updatePS(i: number, partial: Partial<PassengerState>) {
    const s = [...this.passengerStates()];
    s[i] = { ...s[i], ...partial };
    this.passengerStates.set(s);
  }

  selectServiceConfig(i: number, selectedConfig: string) {
    this.updatePS(i, { selectedConfig });
  }

  selectedServiceConfig(ps: PassengerState) {
    return this.serviceConfigs().find(c => String(c.id) === String(ps.selectedConfig));
  }

  doCheckIn(i: number) {
    const ps        = this.passengerStates()[i];
    const passId    = ps.passenger.id;
    const resId     = this.reservation()?.id;
    const segmentId = this.reservation()?.flight?.segments?.[0]?.id;
    if (!passId || !segmentId) { alert('No se encontró información del segmento.'); return; }
    this.bpSvc.create({ passengerId: passId, segmentId, boardingCode: generateBoardingCode(passId), status: 'CHECKED_IN' }).subscribe({
      next: r => {
        const seatToSet = ps.seatInput?.trim().toUpperCase() || this.autoSeatForIndex(i);
        const s2 = [...this.passengerStates()];
        s2[i] = { ...s2[i], boardingPasses: [r.data], checkingIn: false, seatInput: '' };
        this.passengerStates.set(s2);
        if (seatToSet && resId) {
          this.resSvc.setSeat(resId, passId, seatToSet).subscribe({
            next: () => {
              const s3 = [...this.passengerStates()];
              s3[i] = { ...s3[i], passenger: { ...s3[i].passenger, seatNumber: seatToSet } as any };
              this.passengerStates.set(s3);
              if (this.seatPrice(seatToSet) > 0) this.checkoutOpen.set(true);
            },
            error: err => alert(err?.error?.error?.message ?? 'Check-in OK, pero no se pudo asignar el asiento'),
          });
        }
      },
      error: err => alert(err?.error?.error?.message ?? 'Error al hacer check-in'),
    });
  }

  addService(i: number) {
    const ps     = this.passengerStates()[i];
    const config = this.serviceConfigs().find(c => c.id === ps.selectedConfig);
    const passId = ps.passenger.id;
    if (!config || !passId) return;
    this.psSvc.create({ passengerId: passId, serviceConfigId: config.id, quantity: 1, unitPriceAtBooking: Number(config.price) }).subscribe({
      next: r => {
        const s2 = [...this.passengerStates()];
        s2[i] = { ...s2[i], passengerServices: [...s2[i].passengerServices, r.data], addingService: false, selectedConfig: '' };
        this.passengerStates.set(s2);
        this.extrasPaymentRef.set('');
        this.checkoutOpen.set(true);
      },
      error: err => alert(err?.error?.error?.message ?? 'Error al agregar servicio'),
    });
  }

  removeService(i: number, svcId: string) {
    this.psSvc.remove(svcId).subscribe({
      next: () => {
        const s2 = [...this.passengerStates()];
        s2[i] = { ...s2[i], passengerServices: s2[i].passengerServices.filter(s => s.id !== svcId) };
        this.passengerStates.set(s2);
        this.extrasPaymentRef.set('');
        if (this.pendingExtrasTotal() === 0) this.checkoutOpen.set(false);
      },
    });
  }

  cancel(id: string) {
    if (!confirm('¿Cancelar esta reserva?')) return;
    this.cancelling.set(true);
    this.resSvc.cancel(id).subscribe({
      next: () => this.router.navigate(['/my-trips']),
      error: () => this.cancelling.set(false),
    });
  }

  statusStyle(s: string) { return STATUS_STYLES[s] ?? ''; }
  statusLabel(s: string) { return STATUS_LABELS[s] ?? s; }

  checkInLabel(ps: PassengerState) {
    const status = ps.boardingPasses[0]?.checkInStatus ?? 'NOT_CHECKED_IN';
    return CHECKIN_LABELS[status]?.label ?? status;
  }
  checkInColor(ps: PassengerState) {
    const status = ps.boardingPasses[0]?.checkInStatus ?? 'NOT_CHECKED_IN';
    return CHECKIN_LABELS[status]?.color ?? '';
  }

  catLabel(cat?: string) { return cat ? (SERVICE_CAT_LABELS[cat] ?? cat) : ''; }

  seatPrice(seat?: string | null) {
    if (!seat) return 0;
    const row = Number.parseInt(seat, 10);
    const letter = seat.slice(-1).toUpperCase();
    if (row <= 2) return 45;
    if (row === 12) return 30;
    if (letter === 'A' || letter === 'F') return 12;
    if (letter === 'C' || letter === 'D') return 10;
    return 0;
  }

  seatLabel(seat?: string | null) {
    const price = this.seatPrice(seat);
    if (!seat || price === 0) return 'Estandar sin costo';
    const row = Number.parseInt(seat, 10);
    if (row <= 2) return 'Primera fila / espacio preferente';
    if (row === 12) return 'Salida de emergencia';
    const letter = seat.slice(-1).toUpperCase();
    if (letter === 'A' || letter === 'F') return 'Ventana preferente';
    return 'Pasillo preferente';
  }

  seatButtonClass(ps: PassengerState, seat: string) {
    const selected = ps.seatInput === seat;
    const price = this.seatPrice(seat);
    const base = 'h-10 rounded-lg text-[10px] font-bold transition-colors border flex flex-col items-center justify-center leading-none';
    if (selected) return `${base} bg-blue-600 text-white border-blue-600 shadow-sm`;
    if (price > 0) return `${base} bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100`;
    return `${base} bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-200`;
  }

  rowMarkerClass(row: number) {
    const base = 'h-10 flex items-center justify-center rounded-lg text-[10px] font-bold';
    if (this.isExitRow(row)) return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
    return `${base} text-gray-400`;
  }

  isExitRow(row: number) {
    return row === 12;
  }

  selectSeat(i: number, seat: string) {
    this.updatePS(i, { seatInput: seat });
    this.extrasPaymentRef.set('');
    if (this.seatPrice(seat) > 0) this.checkoutOpen.set(true);
    if (this.pendingExtrasTotal() === 0) this.checkoutOpen.set(false);
  }

  autoAssignSeat(i: number) {
    this.updatePS(i, { seatInput: this.autoSeatForIndex(i) });
    this.extrasPaymentRef.set('');
    if (this.pendingExtrasTotal() === 0) this.checkoutOpen.set(false);
  }

  private autoSeatForIndex(i: number) {
    const used = new Set(this.passengerStates().map(ps => ps.passenger.seatNumber).filter(Boolean) as string[]);
    const freeStandard = SEAT_OPTIONS.find(seat => !used.has(seat) && this.seatPrice(seat) === 0);
    return freeStandard ?? SEAT_OPTIONS[i % SEAT_OPTIONS.length];
  }

  serviceExtrasTotal() {
    return this.passengerStates().reduce((total, ps) => total + ps.passengerServices.reduce((sum, svc) => {
      const quantity = Number(svc.quantity ?? 1);
      const unit = Number(svc.unitPriceAtBooking ?? 0);
      return sum + quantity * unit;
    }, 0), 0);
  }

  seatFeesTotal() {
    return this.passengerStates().reduce((total, ps) => {
      const activeSeat = ps.passenger.seatNumber || ps.seatInput;
      return total + this.seatPrice(activeSeat);
    }, 0);
  }

  pendingExtrasTotal() {
    return this.serviceExtrasTotal() + this.seatFeesTotal();
  }

  grandTotal() {
    return Number(this.reservation()?.totalAmount ?? 0) + this.pendingExtrasTotal();
  }

  toggleCheckout() {
    this.checkoutOpen.update(v => !v);
  }

  extraCheckoutItems() {
    const items: { title: string; subtitle: string; amount: number }[] = [];
    this.passengerStates().forEach(ps => {
      const passengerName = `${ps.passenger.firstName} ${ps.passenger.lastName}`.trim();
      ps.passengerServices.forEach(svc => {
        const quantity = Number(svc.quantity ?? 1);
        const unit = Number(svc.unitPriceAtBooking ?? 0);
        items.push({
          title: svc.serviceConfig?.service?.name ?? 'Servicio adicional',
          subtitle: `${passengerName || 'Pasajero'} - ${this.catLabel(svc.serviceConfig?.service?.category)} x${quantity}`,
          amount: quantity * unit,
        });
      });

      const activeSeat = ps.passenger.seatNumber || ps.seatInput;
      const seatAmount = this.seatPrice(activeSeat);
      if (activeSeat && seatAmount > 0) {
        items.push({
          title: `Asiento ${activeSeat}`,
          subtitle: `${passengerName || 'Pasajero'} - ${this.seatLabel(activeSeat)}`,
          amount: seatAmount,
        });
      }
    });
    return items;
  }

  extrasSubtotal() {
    return +(this.pendingExtrasTotal() / 1.15).toFixed(2);
  }

  extrasTaxAmount() {
    return +(this.pendingExtrasTotal() - this.extrasSubtotal()).toFixed(2);
  }

  onExtrasCardInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const formatted = input.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    this.extrasCardDisplay = formatted;
    this.extrasCheckoutForm.get('cardNumber')!.setValue(formatted);
  }

  onExtrasExpiryInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) value = `${value.slice(0, 2)}/${value.slice(2)}`;
    input.value = value;
    this.extrasCheckoutForm.get('expiry')!.setValue(value);
  }

  submitExtrasCheckout() {
    this.extrasCheckoutError.set('');
    this.extrasPaymentRef.set('');
    if (this.pendingExtrasTotal() <= 0) return;
    if (this.extrasCheckoutForm.invalid) {
      this.extrasCheckoutForm.markAllAsTouched();
      this.extrasCheckoutError.set('Completa los datos de facturacion.');
      return;
    }

    const provider = this.extrasCheckoutForm.value.provider;
    if (provider === 'CARD') {
      const card = this.extrasCheckoutForm.value.cardNumber ?? '';
      const expiry = this.extrasCheckoutForm.value.expiry ?? '';
      const cvv = this.extrasCheckoutForm.value.cvv ?? '';
      const holder = this.extrasCheckoutForm.value.cardholderName ?? '';
      if (!holder.trim() || !/^[\d\s]{19}$/.test(card) || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) || !/^\d{3,4}$/.test(cvv)) {
        this.extrasCheckoutError.set('Revisa los datos de la tarjeta.');
        return;
      }
    }

    if (provider === 'PAYPAL') {
      const paypalEmail = this.extrasCheckoutForm.value.paypalEmail ?? '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
        this.extrasCheckoutError.set('Ingresa un correo PayPal valido.');
        return;
      }
    }

    if (provider === 'TRANSFER') {
      const bankReference = this.extrasCheckoutForm.value.bankReference ?? '';
      if (bankReference.trim().length < 6) {
        this.extrasCheckoutError.set('Ingresa una referencia bancaria valida.');
        return;
      }
    }

    this.extrasPayLoading.set(true);
    setTimeout(() => {
      this.extrasPayLoading.set(false);
      this.extrasPaymentRef.set(generateExtraTxId());
    }, 900);
  }

  createdDate(r: Reservation) {
    try { return format(new Date(r.createdAt), "d 'de' MMMM, yyyy", { locale: es }); } catch { return r.createdAt; }
  }
  depTime(r: Reservation) {
    const d = r.flight?.departureDateTime ?? r.flight?.departureDate;
    if (!d) return '--:--';
    try { return format(new Date(d), 'HH:mm'); } catch { return '--:--'; }
  }
  arrTime(r: Reservation) {
    const d = r.flight?.arrivalDateTime;
    if (!d) return '--:--';
    try { return format(new Date(d), 'HH:mm'); } catch { return '--:--'; }
  }
}
