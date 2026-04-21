import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; invoiceNumber: string; reservationId: string; totalAmount: number; issuedAt?: string; reservation?: { reservationCode: string } };
const empty = (): Partial<Row> => ({ invoiceNumber: '', reservationId: '', totalAmount: 0 });

@Component({ selector: 'app-admin-invoices', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Facturas" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['invoiceNumber']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Factura' : 'Nueva Factura'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Número de Factura *</label>
        <input [(ngModel)]="form().invoiceNumber" required placeholder="INV-0001" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Reservation ID *</label>
        <input [(ngModel)]="form().reservationId" required placeholder="UUID de la reserva" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Total ($) *</label>
        <input [(ngModel)]="form().totalAmount" required type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminInvoicesComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'invoiceNumber', label: 'Número', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.invoiceNumber}</span>` },
    { key: 'reservation', label: 'Reserva', render: (r: Row) => r.reservation?.reservationCode ?? '—' },
    { key: 'totalAmount', label: 'Total', render: (r: Row) => `$${r.totalAmount}` },
    { key: 'issuedAt', label: 'Emitida', render: (r: Row) => r.issuedAt ? new Date(r.issuedAt).toLocaleDateString('es-EC') : '—' },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getInvoices().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, reservation, issuedAt, ...body } = this.form() as any;
    const obs = id ? this.svc.updateInvoice(id, body) : this.svc.createInvoice(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteInvoice(id).subscribe(() => this.load()); }
}
