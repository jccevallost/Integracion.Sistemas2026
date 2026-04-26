import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; originAirportIata: string; destinationAirportIata: string; departureDate: string; status: string; flightNumber?: string; airline?: { id: string; name: string; iataCode: string } };
const empty = (): Partial<Row> => ({ originAirportIata: '', destinationAirportIata: '', departureDate: '', status: 'SCHEDULED' });
const toDateInput = (iso: string) => iso ? iso.slice(0, 10) : '';
const STATUS_LABELS: Record<string, string> = { SCHEDULED: 'Programado', DELAYED: 'Retrasado', CANCELLED: 'Cancelado', COMPLETED: 'Completado' };

@Component({ selector: 'app-admin-flights', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Vuelos" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['originAirportIata','destinationAirportIata','status','flightNumber']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Vuelo' : 'Nuevo Vuelo'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Origen IATA *</label>
        <input [(ngModel)]="form().originAirportIata" required maxlength="3" placeholder="UIO" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Destino IATA *</label>
        <input [(ngModel)]="form().destinationAirportIata" required maxlength="3" placeholder="BOG" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Salida *</label>
        <input [(ngModel)]="form().departureDate" required type="date" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select [(ngModel)]="form().status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="SCHEDULED">Programado</option>
          <option value="DELAYED">Retrasado</option>
          <option value="CANCELLED">Cancelado</option>
          <option value="COMPLETED">Completado</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminFlightsComponent implements OnInit {
  private svc = inject(AdminService);
  rows  = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'route', label: 'Ruta', render: (r: Row) => `${r.originAirportIata ?? '?'} → ${r.destinationAirportIata ?? '?'}` },
    { key: 'airline', label: 'Aerolínea', render: (r: Row) => r.airline ? `${r.airline.name} (${r.airline.iataCode})` : '—' },
    { key: 'flightNumber', label: 'N° Vuelo', render: (r: Row) => r.flightNumber ?? '—' },
    { key: 'departureDate', label: 'Fecha', render: (r: Row) => r.departureDate ? new Date(r.departureDate).toLocaleDateString('es-EC') : '—' },
    { key: 'status', label: 'Estado', render: (r: Row) => STATUS_LABELS[r.status] ?? r.status },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getFlights().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r, departureDate: toDateInput(r.departureDate) }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body = { originAirportIata: (f.originAirportIata ?? '').toUpperCase(), destinationAirportIata: (f.destinationAirportIata ?? '').toUpperCase(), departureDate: f.departureDate, status: f.status };
    const obs = f.id ? this.svc.updateFlight(f.id, body) : this.svc.createFlight(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error('Error vuelo:', err); this.saving.set(false); } });
  }
  del(id: string) { this.svc.deleteFlight(id).subscribe(() => this.load()); }
}
