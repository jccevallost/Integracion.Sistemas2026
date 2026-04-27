import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

function generateBoardingCode(passengerId: string) {
  return `BP-${passengerId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
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
  imports: [CommonModule, RouterModule, FormsModule],
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

                      <div class="bg-gray-50 border border-gray-200 rounded-xl p-3">
                        <div class="grid grid-cols-7 gap-1 text-center text-[11px]">
                          <span></span>
                          <span *ngFor="let letter of seatLetters" class="font-semibold text-gray-400">{{ letter }}</span>
                          <ng-container *ngFor="let row of seatRows">
                            <span class="flex items-center justify-center font-semibold text-gray-400">{{ row }}</span>
                            <button *ngFor="let letter of seatLetters" type="button"
                              (click)="selectSeat(i, row + letter)"
                              [class]="seatButtonClass(ps, row + letter)">
                              {{ row }}{{ letter }}
                            </button>
                          </ng-container>
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
                  <select [value]="ps.selectedConfig" (change)="updatePS(i, {selectedConfig: $any($event.target).value})"
                    [disabled]="serviceConfigsLoading() || serviceConfigs().length === 0"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400">
                    <option value="">Selecciona un servicio...</option>
                    <option *ngIf="serviceConfigsLoading()" value="" disabled>Cargando servicios...</option>
                    <option *ngIf="!serviceConfigsLoading() && serviceConfigs().length === 0" value="" disabled>No hay servicios disponibles</option>
                    <option *ngFor="let c of serviceConfigs()" [value]="c.id">
                      {{ catLabel(c.service?.category) }} — {{ c.service?.name ?? c.id }} (\${{ c.price }} {{ c.currency }})
                    </option>
                  </select>
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
                <span>Asientos premium</span>
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
            <div *ngIf="checkoutOpen()" class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
              <p class="font-semibold">Checkout pendiente de pago</p>
              <p>El frontend ya recalcula los extras. Para cobrarlo como aerolinea real falta permitir pagos parciales o cargos adicionales por reserva en el backend.</p>
              <div class="grid grid-cols-3 gap-2 pt-1">
                <button type="button" class="rounded-lg bg-white border border-amber-200 py-2 text-xs font-semibold">Tarjeta</button>
                <button type="button" class="rounded-lg bg-white border border-amber-200 py-2 text-xs font-semibold">PayPal</button>
                <button type="button" class="rounded-lg bg-white border border-amber-200 py-2 text-xs font-semibold">Transferencia</button>
              </div>
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

  loading         = signal(true);
  cancelling      = signal(false);
  reservation     = signal<Reservation | null>(null);
  passengerStates = signal<PassengerState[]>([]);
  serviceConfigs  = signal<AirlineServiceConfig[]>([]);
  serviceConfigsLoading = signal(false);
  serviceConfigsError   = signal('');
  checkoutOpen          = signal(false);
  payment         = signal<Payment | null>(null);
  invoice         = signal<Invoice | null>(null);
  seatRows = SEAT_ROWS;
  seatLetters = SEAT_LETTERS;

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
    const base = 'h-9 rounded-lg text-[11px] font-bold transition-colors border';
    if (selected) return `${base} bg-blue-600 text-white border-blue-600 shadow-sm`;
    if (price > 0) return `${base} bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100`;
    return `${base} bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-200`;
  }

  selectSeat(i: number, seat: string) {
    this.updatePS(i, { seatInput: seat });
  }

  autoAssignSeat(i: number) {
    this.updatePS(i, { seatInput: this.autoSeatForIndex(i) });
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
    return this.passengerStates().reduce((total, ps) => total + this.seatPrice(ps.passenger.seatNumber), 0);
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
