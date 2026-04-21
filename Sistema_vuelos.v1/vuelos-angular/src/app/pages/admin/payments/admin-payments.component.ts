import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; reservationId: string; amount: number; method: string; status: string; transactionId?: string; paidAt?: string; reservation?: { reservationCode: string } };
const empty = (): Partial<Row> => ({ reservationId: '', amount: 0, method: 'CREDIT_CARD', status: 'PENDING' });

@Component({ selector: 'app-admin-payments', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Pagos" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['status','method']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Pago' : 'Nuevo Pago'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Reservation ID *</label>
        <input [(ngModel)]="form().reservationId" required placeholder="UUID de la reserva" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
        <input [(ngModel)]="form().amount" required type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Método</label>
        <select [(ngModel)]="form().method" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="CREDIT_CARD">CREDIT_CARD</option>
          <option value="DEBIT_CARD">DEBIT_CARD</option>
          <option value="PAYPAL">PAYPAL</option>
          <option value="BANK_TRANSFER">BANK_TRANSFER</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select [(ngModel)]="form().status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="FAILED">FAILED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
        <input [(ngModel)]="form().transactionId" placeholder="txn_..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminPaymentsComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'reservation', label: 'Reserva', render: (r: Row) => r.reservation?.reservationCode ?? '—' },
    { key: 'amount', label: 'Monto', render: (r: Row) => `$${r.amount}` },
    { key: 'method', label: 'Método', render: (r: Row) => r.method },
    { key: 'status', label: 'Estado', render: (r: Row) => r.status },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getPayments().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, reservation, paidAt, ...body } = this.form() as any;
    const obs = id ? this.svc.updatePayment(id, body) : this.svc.createPayment(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deletePayment(id).subscribe(() => this.load()); }
}
