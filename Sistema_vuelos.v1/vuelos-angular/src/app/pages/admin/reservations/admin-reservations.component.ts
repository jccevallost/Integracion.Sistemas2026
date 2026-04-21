import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; reservationCode: string; status: string; totalAmount: number; userId?: string; flightClassId?: string; user?: { firstName: string; lastName: string; email: string }; flight?: { flightNumber: string } };
const empty = (): Partial<Row> => ({ status: 'PENDING', totalAmount: 0 });

@Component({ selector: 'app-admin-reservations', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Reservas" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['reservationCode','status']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Reserva' : 'Nueva Reserva'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select [(ngModel)]="form().status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Total ($)</label>
        <input [(ngModel)]="form().totalAmount" type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminReservationsComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'reservationCode', label: 'Código', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.reservationCode}</span>` },
    { key: 'user', label: 'Pasajero', render: (r: Row) => r.user ? `${r.user.firstName} ${r.user.lastName}` : '—' },
    { key: 'status', label: 'Estado', render: (r: Row) => r.status },
    { key: 'totalAmount', label: 'Total', render: (r: Row) => `$${r.totalAmount}` },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getReservations().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, user, flight, ...body } = this.form() as any;
    const obs = id ? this.svc.updateReservation(id, body) : this.svc.createReservation(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteReservation(id).subscribe(() => this.load()); }
}
