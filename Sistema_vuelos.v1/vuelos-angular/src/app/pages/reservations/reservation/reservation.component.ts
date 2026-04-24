import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ReservationsService } from '../../../core/services/reservations.service';
import { PaymentsService } from '../../../core/services/payments.service';
import { PromotionsService } from '../../../core/services/promotions.service';
import { InvoicesService } from '../../../core/services/invoices.service';
import type { PromotionValidation, Invoice } from '../../../core/models/domain';

const CARD_PROVIDERS = [
  { value: 'VISA', label: 'Visa' }, { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'AMEX', label: 'American Express' }, { value: 'PAYPAL', label: 'PayPal' },
];

function generateTxId() {
  return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">

      <!-- Pantalla de éxito -->
      <ng-container *ngIf="successData() as sd">
        <div class="flex flex-col items-center text-center py-10 space-y-6">
          <div class="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">¡Pago exitoso!</h1>
            <p class="text-sm text-gray-500 mt-1">Tu reserva ha sido confirmada</p>
          </div>
          <div class="w-full bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 text-left">
            <div class="flex items-center justify-between px-5 py-3">
              <span class="text-sm text-gray-500">Código de reserva</span>
              <span class="font-mono font-bold text-blue-600">{{ sd.reservationCode }}</span>
            </div>
            <ng-container *ngIf="sd.invoice as inv">
              <div class="flex items-center justify-between px-5 py-3">
                <span class="text-sm text-gray-500">N° Factura</span>
                <span class="font-mono font-semibold text-gray-800">{{ inv.invoiceNumber }}</span>
              </div>
              <div class="flex items-center justify-between px-5 py-3">
                <span class="text-sm text-gray-500">Subtotal</span>
                <span class="text-sm text-gray-700">\${{ (+inv.subtotal).toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between px-5 py-3">
                <span class="text-sm text-gray-500">IVA 15%</span>
                <span class="text-sm text-gray-700">\${{ (+inv.taxAmount).toFixed(2) }}</span>
              </div>
              <div class="flex items-center justify-between px-5 py-4">
                <span class="font-semibold text-gray-800">Total pagado</span>
                <span class="text-xl font-bold text-blue-600">\${{ (+inv.total).toFixed(2) }}</span>
              </div>
            </ng-container>
            <div *ngIf="!sd.invoice" class="flex items-center justify-between px-5 py-4">
              <span class="font-semibold text-gray-800">Total pagado</span>
              <span class="text-xl font-bold text-blue-600">—</span>
            </div>
          </div>
          <p class="text-xs text-gray-400">La factura fue generada automáticamente y está disponible en el detalle de tu reserva.</p>
          <button (click)="router.navigate(['/my-trips', sd.reservationId])"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Ver mi reserva
          </button>
        </div>
      </ng-container>

      <ng-container *ngIf="!successData()">
      <button (click)="goBack()" class="text-sm text-blue-600 hover:underline mb-6 flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        {{ step() === 2 ? 'Volver a datos de pasajeros' : 'Volver' }}
      </button>

      <!-- Steps -->
      <div class="flex items-center gap-3 mb-8">
        <ng-container *ngFor="let s of steps; let i = index">
          <div class="flex items-center gap-2 flex-1">
            <div [class]="'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ' + stepClass(s.n)">
              <svg *ngIf="step() > s.n" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span *ngIf="step() <= s.n">{{ s.n }}</span>
            </div>
            <span [class]="'text-sm font-medium ' + (step() === s.n ? 'text-blue-700' : 'text-gray-400')">{{ s.label }}</span>
            <div *ngIf="i < steps.length - 1" [class]="'flex-1 h-0.5 mx-2 ' + (step() > s.n ? 'bg-green-400' : 'bg-gray-200')"></div>
          </div>
        </ng-container>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ step() === 1 ? 'Datos de pasajeros' : 'Información de pago' }}</h1>
      <p class="text-sm text-gray-500 mb-8">{{ step() === 1 ? 'Ingresa los datos de todos los pasajeros' : 'Ingresa los datos de tu tarjeta' }}</p>

      <div *ngIf="errorMsg()" class="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p class="text-sm text-red-700">{{ errorMsg() }}</p>
      </div>

      <!-- Step 1: Pasajeros -->
      <form *ngIf="step() === 1" [formGroup]="passengerForm" (ngSubmit)="nextStep()" class="space-y-6">
        <section>
          <div class="flex items-center justify-between mb-3">
            <h2 class="font-semibold text-gray-800">Pasajeros</h2>
            <button type="button" (click)="addPassenger()" class="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Añadir pasajero
            </button>
          </div>

          <div formArrayName="passengers" class="space-y-4">
            <div *ngFor="let pg of passengerArray.controls; let i = index" [formGroupName]="i"
              class="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  Pasajero {{ i + 1 }}
                </h3>
                <button *ngIf="passengerArray.length > 1" type="button" (click)="removePassenger(i)" class="text-red-400 hover:text-red-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
                  <input formControlName="firstName" placeholder="Juan"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Apellido</label>
                  <input formControlName="lastName" placeholder="Pérez"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">N° documento</label>
                  <input formControlName="documentNumber" placeholder="A1234567"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Promo -->
        <section class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            ¿Tienes un código de descuento?
          </h2>
          <div class="flex gap-2">
            <input [(ngModel)]="promoCode" [ngModelOptions]="{standalone: true}" placeholder="Ej: VERANO25"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
            <button type="button" (click)="validatePromo()" [disabled]="promoLoading() || !promoCode"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              <svg *ngIf="promoLoading()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span *ngIf="!promoLoading()">Aplicar</span>
            </button>
          </div>
          <div *ngIf="promoResult()" class="mt-3 flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Código <strong>{{ promoResult()!.code }}</strong> — Ahorro: \${{ promoResult()!.discountAmount.toFixed(2) }}
          </div>
          <p *ngIf="promoError()" class="mt-2 text-xs text-red-500">{{ promoError() }}</p>
        </section>

        <button type="submit"
          class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
          Continuar al pago
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </form>

      <!-- Step 2: Pago -->
      <form *ngIf="step() === 2" [formGroup]="payForm" (ngSubmit)="submitPayment()" class="space-y-6">
        <!-- Resumen -->
        <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p class="text-sm font-semibold text-gray-700 mb-2">Resumen de la reserva</p>
          <div class="space-y-1">
            <div *ngFor="let p of passengerArray.value; let i = index" class="flex items-center gap-2 text-sm text-gray-600">
              <svg class="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span>{{ p.firstName }} {{ p.lastName }} — {{ p.documentNumber }}</span>
            </div>
            <div *ngIf="promoResult()" class="flex items-center gap-2 text-sm text-green-600 mt-2 pt-2 border-t border-blue-200">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
              <span>Descuento <strong>{{ promoResult()!.code }}</strong>: -\${{ promoResult()!.discountAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Pago -->
        <section class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 class="font-semibold text-gray-800 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Método de pago
          </h2>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-2">Tipo de tarjeta</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <label *ngFor="let p of cardProviders" class="cursor-pointer">
                <input type="radio" formControlName="provider" [value]="p.value" class="sr-only peer" />
                <div class="border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 rounded-lg px-3 py-2 text-center text-xs font-semibold text-gray-600 peer-checked:text-blue-700 transition-colors">
                  {{ p.label }}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Nombre en la tarjeta</label>
            <input formControlName="cardholderName" placeholder="JUAN PÉREZ"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Número de tarjeta</label>
            <input formControlName="cardNumber" placeholder="1234 5678 9012 3456"
              [value]="cardDisplay" (input)="onCardInput($event)"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Vencimiento</label>
              <input formControlName="expiry" placeholder="MM/AA" maxlength="5" (input)="onExpiryInput($event)"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">CVV</label>
              <input formControlName="cvv" type="password" placeholder="123" maxlength="4"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </section>

        <div class="flex items-center gap-2 text-xs text-gray-400">
          <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          Transacción cifrada con SSL.
        </div>

        <button type="submit" [disabled]="payLoading()"
          class="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md">
          <svg *ngIf="payLoading()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <svg *ngIf="!payLoading()" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          {{ payLoading() ? 'Procesando pago...' : 'Confirmar y pagar' }}
        </button>
      </form>
      </ng-container>
    </div>
  `,
})
export class ReservationComponent implements OnInit {
  private route      = inject(ActivatedRoute);
  router             = inject(Router);
  private fb         = inject(FormBuilder);
  private resSvc     = inject(ReservationsService);
  private paymentSvc = inject(PaymentsService);
  private promoSvc   = inject(PromotionsService);
  private invoiceSvc = inject(InvoicesService);

  step           = signal<1 | 2>(1);
  errorMsg       = signal<string | null>(null);
  payLoading     = signal(false);
  promoLoading   = signal(false);
  promoError     = signal<string | null>(null);
  promoResult    = signal<PromotionValidation | null>(null);
  successData    = signal<{ reservationId: string; reservationCode: string; invoice: Invoice | null } | null>(null);
  promoCode      = '';
  cardDisplay    = '';
  cardProviders  = CARD_PROVIDERS;
  steps = [{ n: 1, label: 'Pasajeros' }, { n: 2, label: 'Pago' }];

  flightClassId = '';

  passengerForm = this.fb.group({
    passengers: this.fb.array([this.createPassengerGroup()]),
  });

  payForm = this.fb.group({
    provider:       ['VISA', Validators.required],
    cardholderName: ['', Validators.required],
    cardNumber:     ['', [Validators.required, Validators.pattern(/^[\d\s]{19}$/)]],
    expiry:         ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv:            ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  get passengerArray() { return this.passengerForm.get('passengers') as FormArray; }

  createPassengerGroup() {
    return this.fb.group({
      firstName:      ['', Validators.required],
      lastName:       ['', Validators.required],
      documentNumber: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.flightClassId = this.route.snapshot.paramMap.get('flightClassId') ?? '';
  }

  addPassenger()         { this.passengerArray.push(this.createPassengerGroup()); }
  removePassenger(i: number) { this.passengerArray.removeAt(i); }

  stepClass(n: number) {
    if (this.step() === n) return 'bg-blue-600 text-white';
    if (this.step() > n)  return 'bg-green-500 text-white';
    return 'bg-gray-200 text-gray-500';
  }

  goBack() {
    if (this.step() === 2) this.step.set(1);
    else this.router.navigate(['/results']);
  }

  nextStep() {
    if (this.passengerForm.invalid) { this.passengerForm.markAllAsTouched(); return; }
    this.step.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  validatePromo() {
    if (!this.promoCode) return;
    this.promoLoading.set(true);
    this.promoError.set(null);
    const base = 100 * this.passengerArray.length;
    this.promoSvc.validate(this.promoCode, base).subscribe({
      next: res => { this.promoResult.set(res.data); this.promoLoading.set(false); },
      error: err => {
        this.promoError.set(err?.error?.error?.message ?? 'Código inválido');
        this.promoResult.set(null);
        this.promoLoading.set(false);
      },
    });
  }

  onCardInput(e: Event) {
    const inp = (e.target as HTMLInputElement);
    const fmt = inp.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    this.cardDisplay = fmt;
    this.payForm.get('cardNumber')!.setValue(fmt);
  }

  onExpiryInput(e: Event) {
    const inp = (e.target as HTMLInputElement);
    let v = inp.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    inp.value = v;
    this.payForm.get('expiry')!.setValue(v);
  }

  submitPayment() {
    if (this.payForm.invalid) { this.payForm.markAllAsTouched(); return; }
    this.payLoading.set(true);
    this.errorMsg.set(null);

    const passengers = this.passengerArray.value;
    const promo      = this.promoResult();

    this.resSvc.create({
      flightClassId: this.flightClassId,
      passengers,
      promotionCode: promo ? this.promoCode : undefined,
    }).subscribe({
      next: res => {
        const reservation = res.data;
        this.paymentSvc.create({
          reservationId: reservation.id,
          amount:        reservation.totalAmount,
          provider:      this.payForm.value.provider!,
          transactionId: generateTxId(),
        }).subscribe({
          next: payRes => {
            const payment = payRes.data;
            setTimeout(() => {
              this.invoiceSvc.byPayment(payment.id).subscribe({
                next: invRes => {
                  this.payLoading.set(false);
                  this.successData.set({ reservationId: reservation.id, reservationCode: reservation.reservationCode, invoice: invRes.data });
                },
                error: () => {
                  this.payLoading.set(false);
                  this.successData.set({ reservationId: reservation.id, reservationCode: reservation.reservationCode, invoice: null });
                },
              });
            }, 1200);
          },
          error: () => {
            this.payLoading.set(false);
            this.successData.set({ reservationId: reservation.id, reservationCode: reservation.reservationCode, invoice: null });
          },
        });
      },
      error: err => {
        this.errorMsg.set(err?.error?.error?.message ?? 'Error al crear la reserva');
        this.payLoading.set(false);
      },
    });
  }
}
