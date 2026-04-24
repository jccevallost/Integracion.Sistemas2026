import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; invoiceNumber: string; paymentId: string; billingProfileId: string; subtotal: number; taxAmount: number; total: number; createdAt?: string };
const empty = (): Partial<Row> => ({ invoiceNumber: '', paymentId: '', billingProfileId: '', subtotal: 0, taxAmount: 0, total: 0 });

@Component({ selector: 'app-admin-invoices', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Facturas" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['invoiceNumber']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Factura' : 'Nueva Factura'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Número de Factura *</label>
        <input [(ngModel)]="form().invoiceNumber" required placeholder="INV-0001" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Payment ID *</label>
        <input [(ngModel)]="form().paymentId" required placeholder="UUID del pago" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Billing Profile ID *</label>
        <input [(ngModel)]="form().billingProfileId" required placeholder="UUID del perfil de facturación" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Subtotal *</label>
        <input [(ngModel)]="form().subtotal" required type="number" min="0" step="0.01" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">IVA (taxAmount) *</label>
        <input [(ngModel)]="form().taxAmount" required type="number" min="0" step="0.01" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Total *</label>
        <input [(ngModel)]="form().total" required type="number" min="0" step="0.01" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminInvoicesComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'invoiceNumber', label: 'Número', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.invoiceNumber}</span>` },
    { key: 'subtotal', label: 'Subtotal', render: (r: Row) => `$${r.subtotal}` },
    { key: 'taxAmount', label: 'IVA', render: (r: Row) => `$${r.taxAmount}` },
    { key: 'total', label: 'Total', render: (r: Row) => `$${r.total}` },
    { key: 'createdAt', label: 'Fecha', render: (r: Row) => r.createdAt ? new Date(r.createdAt).toLocaleDateString('es-EC') : '—' },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getInvoices().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body = { invoiceNumber: f.invoiceNumber, paymentId: f.paymentId, billingProfileId: f.billingProfileId, subtotal: Number(f.subtotal), taxAmount: Number(f.taxAmount), total: Number(f.total) };
    const obs = f.id ? this.svc.updateInvoice(f.id, body) : this.svc.createInvoice(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteInvoice(id).subscribe(() => this.load()); }
}
