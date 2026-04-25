import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; invoiceId: string; description: string; quantity: number; unitPrice: number; totalPrice: number; invoice?: { invoiceNumber: string } };
type Invoice = { id: string; invoiceNumber: string; total: number };
const empty = (): Partial<Row> => ({ invoiceId: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 });

@Component({ selector: 'app-admin-invoice-items', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Ítems de Factura" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['description']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Ítem' : 'Nuevo Ítem'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Factura *</label>
        <select [(ngModel)]="form().invoiceId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona factura —</option>
          <option *ngFor="let i of invoices()" [value]="i.id">{{ i.invoiceNumber }} — $ {{ (+i.total).toFixed(2) }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
        <input [(ngModel)]="form().description" required placeholder='Boleto UIO-MAD (Pasajero: Juan Pérez)' class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div class="grid grid-cols-3 gap-3">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
          <input [(ngModel)]="form().quantity" required type="number" min="1" (ngModelChange)="recalc()" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">P. Unitario *</label>
          <input [(ngModel)]="form().unitPrice" required type="number" min="0" step="0.01" (ngModelChange)="recalc()" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Total</label>
          <input [ngModel]="form().totalPrice" readonly class="w-full px-3 py-2 text-sm border border-gray-100 bg-gray-50 rounded-lg outline-none text-gray-500" /></div>
      </div>
    </app-admin-form-modal>`,
})
export class AdminInvoiceItemsComponent implements OnInit {
  private svc = inject(AdminService);
  rows     = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal    = signal(false); form = signal<Partial<Row>>(empty());
  invoices = signal<Invoice[]>([]);
  cols = [
    { key: 'invoice',     label: 'Factura',     render: (r: Row) => (r as any).invoice?.invoiceNumber ?? '—' },
    { key: 'description', label: 'Descripción', render: (r: Row) => r.description },
    { key: 'quantity',    label: 'Qty',          render: (r: Row) => String(r.quantity) },
    { key: 'unitPrice',   label: 'P. Unit.',     render: (r: Row) => `$${(+r.unitPrice).toFixed(2)}` },
    { key: 'totalPrice',  label: 'Total',        render: (r: Row) => `$${(+r.totalPrice).toFixed(2)}` },
  ];
  ngOnInit() {
    this.load();
    this.svc.getInvoices().subscribe((d: any) => this.invoices.set(d));
  }
  recalc() {
    const f = this.form() as any;
    const total = +(Number(f.quantity || 0) * Number(f.unitPrice || 0)).toFixed(2);
    this.form.set({ ...f, totalPrice: total });
  }
  load() { this.svc.getInvoiceItems().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body = { invoiceId: f.invoiceId, description: f.description, quantity: Number(f.quantity), unitPrice: Number(f.unitPrice), totalPrice: Number(f.totalPrice) };
    const obs = f.id ? this.svc.updateInvoiceItem(f.id, body) : this.svc.createInvoiceItem(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error(err); this.saving.set(false); } }); }
  del(id: string) { this.svc.deleteInvoiceItem(id).subscribe(() => this.load()); }
}
