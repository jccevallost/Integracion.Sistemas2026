import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; invoiceNumber: string; paymentId: string; billingProfileId: string; subtotal: number; taxAmount: number; total: number; createdAt?: string; payment?: { amount: number; reservation?: { reservationCode: string } }; billingProfile?: { businessName: string; taxId: string } };
type Payment        = { id: string; amount: number; transactionId?: string; reservation?: { reservationCode: string } };
type BillingProfile = { id: string; businessName: string; taxId: string };

function genInvNum() {
  const now = new Date();
  return `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
}
const empty = (): Partial<Row> => ({ invoiceNumber: genInvNum(), paymentId: '', billingProfileId: '', subtotal: 0, taxAmount: 0, total: 0 });

@Component({ selector: 'app-admin-invoices', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Facturas" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['invoiceNumber']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>

    <app-admin-form-modal [title]="form().id ? 'Editar Factura' : 'Nueva Factura'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">

      <div><label class="block text-sm font-medium text-gray-700 mb-1">N° de Factura *</label>
        <div class="flex gap-2">
          <input [(ngModel)]="form().invoiceNumber" required placeholder="INV-20250101-XXXXXX"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
          <button type="button" (click)="regenInv()"
            class="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors whitespace-nowrap">↻ Generar</button>
        </div></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Pago *</label>
        <select [(ngModel)]="form().paymentId" required (ngModelChange)="onPaymentChange($event)"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona pago —</option>
          <option *ngFor="let p of payments()" [value]="p.id">
            {{ p.reservation?.reservationCode ?? p.id.slice(0,8) }} — $ {{ (+p.amount).toFixed(2) }}{{ p.transactionId ? ' · ' + p.transactionId.slice(0,16) + '…' : '' }}
          </option>
        </select></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Perfil de facturación *</label>
        <select [(ngModel)]="form().billingProfileId" required
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona perfil —</option>
          <option *ngFor="let b of billingProfiles()" [value]="b.id">{{ b.businessName }} · {{ b.taxId }}</option>
        </select></div>

      <div class="bg-gray-50 rounded-xl p-4 space-y-3">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Desglose IVA 15%</p>
        <div class="grid grid-cols-3 gap-3">
          <div><label class="block text-xs font-medium text-gray-500 mb-1">Subtotal *</label>
            <input [(ngModel)]="form().subtotal" required type="number" min="0" step="0.01" (ngModelChange)="recalc('subtotal')"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">IVA (15%)</label>
            <input [ngModel]="form().taxAmount" readonly class="w-full px-3 py-2 text-sm border border-gray-100 bg-white rounded-lg outline-none text-gray-500" /></div>
          <div><label class="block text-xs font-medium text-gray-500 mb-1">Total</label>
            <input [ngModel]="form().total" readonly class="w-full px-3 py-2 text-sm border border-gray-100 bg-white rounded-lg outline-none font-semibold text-blue-600" /></div>
        </div>
        <p class="text-xs text-gray-400">Al seleccionar un pago, los montos se auto-calculan desde el monto del pago.</p>
      </div>
    </app-admin-form-modal>`,
})
export class AdminInvoicesComponent implements OnInit {
  private svc = inject(AdminService);
  rows            = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal           = signal(false); form = signal<Partial<Row>>(empty());
  payments        = signal<Payment[]>([]); billingProfiles = signal<BillingProfile[]>([]);

  cols = [
    { key: 'invoiceNumber',  label: 'Número',    renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.invoiceNumber}</span>` },
    { key: 'billingProfile', label: 'Razón Social', render: (r: Row) => r.billingProfile?.businessName ?? '—' },
    { key: 'subtotal',  label: 'Subtotal', render: (r: Row) => `$${(+r.subtotal).toFixed(2)}` },
    { key: 'taxAmount', label: 'IVA',      render: (r: Row) => `$${(+r.taxAmount).toFixed(2)}` },
    { key: 'total',     label: 'Total',    renderHtml: (r: Row) => `<span class="font-semibold text-blue-600">$${(+r.total).toFixed(2)}</span>` },
    { key: 'createdAt', label: 'Fecha',    render: (r: Row) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-EC') : '—' },
  ];

  ngOnInit() {
    this.load();
    this.svc.getPayments().subscribe((d: any) => this.payments.set(d));
    this.svc.getBillingProfiles().subscribe((d: any) => this.billingProfiles.set(d));
  }

  onPaymentChange(paymentId: string) {
    const p = this.payments().find(x => x.id === paymentId);
    if (!p) return;
    const total    = +(Number(p.amount)).toFixed(2);
    const subtotal = +(total / 1.15).toFixed(2);
    const taxAmount= +(total - subtotal).toFixed(2);
    this.form.set({ ...this.form(), subtotal, taxAmount, total });
  }

  recalc(_from: string) {
    const f = this.form() as any;
    const sub = Number(f.subtotal || 0);
    const tax = +(sub * 0.15).toFixed(2);
    const tot = +(sub + tax).toFixed(2);
    this.form.set({ ...f, taxAmount: tax, total: tot });
  }

  regenInv() { this.form.set({ ...this.form(), invoiceNumber: genInvNum() }); }

  load() { this.svc.getInvoices().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }

  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body = { invoiceNumber: f.invoiceNumber, paymentId: f.paymentId, billingProfileId: f.billingProfileId, subtotal: Number(f.subtotal), taxAmount: Number(f.taxAmount), total: Number(f.total) };
    const obs = f.id ? this.svc.updateInvoice(f.id, body) : this.svc.createInvoice(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error(err); this.saving.set(false); } });
  }
  del(id: string) { this.svc.deleteInvoice(id).subscribe(() => this.load()); }
}
