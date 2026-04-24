import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; flightNumber: string; airlineId: string; aircraftId: string; status: string; originAirportIata?: string; destinationAirportIata?: string; originAirport?: { iataCode: string }; destinationAirport?: { iataCode: string } };
type Airline  = { id: string; name: string; iataCode: string };
type Aircraft = { id: string; modelName: string; registration: string };
const empty = (): Partial<Row> => ({ flightNumber: '', airlineId: '', aircraftId: '', status: 'SCHEDULED' });

@Component({ selector: 'app-admin-flights', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Vuelos" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['flightNumber','status']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Vuelo' : 'Nuevo Vuelo'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Número de Vuelo *</label>
        <input [(ngModel)]="form().flightNumber" required placeholder="LA1234" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aerolínea *</label>
        <select [(ngModel)]="form().airlineId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona —</option>
          <option *ngFor="let a of airlines()" [value]="a.id">{{ a.name }} ({{ a.iataCode }})</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aeronave *</label>
        <select [(ngModel)]="form().aircraftId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona —</option>
          <option *ngFor="let a of aircraft()" [value]="a.id">{{ a.modelName }} · {{ a.registration }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select [(ngModel)]="form().status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="SCHEDULED">Programado</option>
          <option value="ACTIVE">En vuelo</option>
          <option value="DELAYED">Retrasado</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="COMPLETED">Completado</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminFlightsComponent implements OnInit {
  private svc = inject(AdminService);
  rows     = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal    = signal(false); form = signal<Partial<Row>>(empty());
  airlines = signal<Airline[]>([]);
  aircraft = signal<Aircraft[]>([]);
  cols = [
    { key: 'flightNumber', label: 'Vuelo', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.flightNumber}</span>` },
    { key: 'route', label: 'Ruta', render: (r: Row) => `${r.originAirportIata ?? r.originAirport?.iataCode ?? '?'} → ${r.destinationAirportIata ?? r.destinationAirport?.iataCode ?? '?'}` },
    { key: 'status', label: 'Estado', render: (r: Row) => r.status },
  ];
  ngOnInit() {
    this.load();
    this.svc.getAirlines().subscribe((d: any) => this.airlines.set(d));
    this.svc.getAircraft().subscribe((d: any) => this.aircraft.set(d));
  }
  load() { this.svc.getFlights().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, originAirport, destinationAirport, ...body } = this.form() as any;
    const obs = id ? this.svc.updateFlight(id, body) : this.svc.createFlight(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteFlight(id).subscribe(() => this.load()); }
}
