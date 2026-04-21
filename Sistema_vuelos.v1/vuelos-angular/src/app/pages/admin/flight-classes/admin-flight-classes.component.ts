import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; flightId: string; classType: string; basePrice: number; totalSeats: number; availableSeats: number; flight?: { flightNumber: string } };
type Flight = { id: string; flightNumber: string };
const empty = (): Partial<Row> => ({ flightId: '', classType: 'ECONOMY', basePrice: 0, totalSeats: 0, availableSeats: 0 });

@Component({ selector: 'app-admin-flight-classes', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Clases de Vuelo" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['classType']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Clase' : 'Nueva Clase'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Vuelo *</label>
        <select [(ngModel)]="form().flightId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona un vuelo —</option>
          <option *ngFor="let f of flights()" [value]="f.id">{{ f.flightNumber }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Clase *</label>
        <select [(ngModel)]="form().classType" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="ECONOMY">Económica</option>
          <option value="BUSINESS">Business</option>
          <option value="FIRST">Primera clase</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Precio Base ($) *</label>
        <input [(ngModel)]="form().basePrice" required type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Total Asientos *</label>
        <input [(ngModel)]="form().totalSeats" required type="number" min="1" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Asientos Disponibles</label>
        <input [(ngModel)]="form().availableSeats" type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminFlightClassesComponent implements OnInit {
  private svc = inject(AdminService);
  rows    = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal   = signal(false); form = signal<Partial<Row>>(empty());
  flights = signal<Flight[]>([]);
  cols = [
    { key: 'flight', label: 'Vuelo', render: (r: Row) => r.flight?.flightNumber ?? '—' },
    { key: 'classType', label: 'Clase', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.classType}</span>` },
    { key: 'basePrice', label: 'Precio', render: (r: Row) => `\$${r.basePrice}` },
    { key: 'seats', label: 'Asientos', render: (r: Row) => `${r.availableSeats ?? 0}/${r.totalSeats}` },
  ];
  ngOnInit() {
    this.load();
    this.svc.getFlights().subscribe((d: any) => this.flights.set(d));
  }
  load() { this.svc.getFlightClasses().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, flight, ...body } = this.form() as any;
    const obs = id ? this.svc.updateFlightClass(id, body) : this.svc.createFlightClass(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteFlightClass(id).subscribe(() => this.load()); }
}
