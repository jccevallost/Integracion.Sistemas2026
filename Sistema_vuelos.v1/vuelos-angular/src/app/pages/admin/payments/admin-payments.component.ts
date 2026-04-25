import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; reservationId: string; amount: number; provider: string; status: string; transactionId?: string; reservation?: { reservationCode: string; totalAmount: number } };
type Reservation = { id: string; reservationCode: string; totalAmount: number; user?: { firstName: string; firstLastName: string } };

const PROVIDERS = ['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL'];
const STATUS_OPTS = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
function genTxId() { return `TXN-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; }
const empty = (): Partial<Row> => ({ reservationId: '', amount: 0, provider: 'VISA', status: 'PENDING', transactionId: genTxId() });

@Component({ selector: 'app-admin-payments', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Pagos" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['status','provider']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>

    <app-admin-form-modal [title]="form().id ? 'Editar Pago' : 'Registrar Pago'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Reserva *</label>
        <select [(ngModel)]="form().reservationId" required (ngModelChange)="onReservationChange($event)"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona reserva —</option>
          <option *ngFor="let r of reservations()" [value]="r.id">
            {{ r.reservationCode }}{{ r.user ? ' · ' + r.user.firstName + ' ' + r.user.firstLastName : '' }} — ${{ (+r.totalAmount).toFixed(2) }}
          </option>
        </select></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
          <input [(ngModel)]="form().amount" required type="number" min="0" step="0.01"
            class="w-full pl-7 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <p class="text-xs text-gray-400 mt-1">Se llena automáticamente con el total de la reserva seleccionada.</p></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-2">Método de pago *</label>
        <div class="grid grid-cols-4 gap-2">
          <label *ngFor="let p of providers" class="cursor-pointer">
            <input type="radio" [(ngModel)]="form().provider" [value]="p" class="sr-only peer" />
            <div class="border-2 border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 rounded-lg px-2 py-2 text-center text-xs font-semibold text-gray-600 peer-checked:text-blue-700 transition-colors">
              {{ p }}
            </div>
          </label>
        </div></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">ID de transacción *</label>
        <div class="flex gap-2">
          <input [(ngModel)]="form().transactionId" required placeholder="TXN-..."
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
          <button type="button" (click)="regenTx()"
            class="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors whitespace-nowrap">↻ Generar</button>
        </div></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select [(ngModel)]="form().status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option *ngFor="let s of statusOpts" [value]="s">{{ s }}</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminPaymentsComponent implements OnInit {
  private svc = inject(AdminService);
  rows         = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal        = signal(false); form = signal<Partial<Row>>(empty());
  reservations = signal<Reservation[]>([]);
  providers    = PROVIDERS; statusOpts = STATUS_OPTS;

  cols = [
    { key: 'reservation', label: 'Reserva',   render: (r: Row) => r.reservation?.reservationCode ?? '—' },
    { key: 'amount',      label: 'Monto',     render: (r: Row) => `$${(+r.amount).toFixed(2)}` },
    { key: 'provider',    label: 'Proveedor', render: (r: Row) => r.provider },
    { key: 'status',      label: 'Estado',    render: (r: Row) => r.status },
    { key: 'transactionId', label: 'TX ID',   render: (r: Row) => r.transactionId ? r.transactionId.slice(0, 20) + '…' : '—' },
  ];

  ngOnInit() {
    this.load();
    this.svc.getReservations().subscribe((d: any) => this.reservations.set(d));
  }

  onReservationChange(id: string) {
    const res = this.reservations().find(r => r.id === id);
    if (res) this.form.set({ ...this.form(), amount: Number(res.totalAmount) });
  }

  regenTx() { this.form.set({ ...this.form(), transactionId: genTxId() }); }

  load() { this.svc.getPayments().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }

  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body = { reservationId: f.reservationId, amount: Number(f.amount), provider: f.provider, transactionId: f.transactionId, status: f.status };
    const obs = f.id ? this.svc.updatePayment(f.id, body) : this.svc.createPayment(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error('Error pago:', err); this.saving.set(false); } });
  }
  del(id: string) { this.svc.deletePayment(id).subscribe(() => this.load()); }
}
