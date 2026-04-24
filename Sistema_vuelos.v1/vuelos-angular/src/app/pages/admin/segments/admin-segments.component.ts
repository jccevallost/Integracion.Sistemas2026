import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; segmentNumber: string; flightId?: string; originAirportId: string; destinationAirportId: string; departureDateTime: string; arrivalDateTime: string; airlineId: string; aircraftId?: string; estimatedDuration: number; originAirport?: { iataCode: string }; destinationAirport?: { iataCode: string } };
type Flight  = { id: string; flightNumber: string };
type Airport = { id: string; iataCode: string; name: string; city?: { name: string } };
type Airline = { id: string; name: string; iataCode: string };
type Aircraft = { id: string; modelName: string; registration: string };
const empty = (): Partial<Row> => ({ segmentNumber: '', flightId: '', originAirportId: '', destinationAirportId: '', departureDateTime: '', arrivalDateTime: '', airlineId: '', aircraftId: '', estimatedDuration: 60 });
const toLocalInput = (iso: string) => iso ? iso.slice(0, 16) : '';

@Component({ selector: 'app-admin-segments', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Segmentos" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['segmentNumber']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Segmento' : 'Nuevo Segmento'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Número de Segmento *</label>
        <input [(ngModel)]="form().segmentNumber" required placeholder="AV101" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Vuelo</label>
        <select [(ngModel)]="form().flightId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Sin vuelo —</option>
          <option *ngFor="let f of flights()" [value]="f.id">{{ f.flightNumber }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aerolínea *</label>
        <select [(ngModel)]="form().airlineId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona —</option>
          <option *ngFor="let a of airlines()" [value]="a.id">{{ a.name }} ({{ a.iataCode }})</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aeropuerto Origen *</label>
        <select [(ngModel)]="form().originAirportId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona —</option>
          <option *ngFor="let a of airports()" [value]="a.id">{{ a.iataCode }} — {{ a.city?.name ?? a.name }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aeropuerto Destino *</label>
        <select [(ngModel)]="form().destinationAirportId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona —</option>
          <option *ngFor="let a of airports()" [value]="a.id">{{ a.iataCode }} — {{ a.city?.name ?? a.name }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aeronave</label>
        <select [(ngModel)]="form().aircraftId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Sin aeronave —</option>
          <option *ngFor="let a of aircraft()" [value]="a.id">{{ a.modelName }} · {{ a.registration }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Salida *</label>
        <input [(ngModel)]="form().departureDateTime" required type="datetime-local" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Llegada *</label>
        <input [(ngModel)]="form().arrivalDateTime" required type="datetime-local" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Duración estimada (minutos) *</label>
        <input [(ngModel)]="form().estimatedDuration" required type="number" min="1" placeholder="90" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminSegmentsComponent implements OnInit {
  private svc = inject(AdminService);
  rows     = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal    = signal(false); form = signal<Partial<Row>>(empty());
  flights  = signal<Flight[]>([]);
  airports = signal<Airport[]>([]);
  airlines = signal<Airline[]>([]);
  aircraft = signal<Aircraft[]>([]);
  cols = [
    { key: 'segmentNumber', label: 'Segmento', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.segmentNumber}</span>` },
    { key: 'route', label: 'Ruta', render: (r: Row) => `${r.originAirport?.iataCode ?? '?'} → ${r.destinationAirport?.iataCode ?? '?'}` },
    { key: 'departureDateTime', label: 'Salida', render: (r: Row) => r.departureDateTime ? new Date(r.departureDateTime).toLocaleString('es-EC') : '—' },
    { key: 'arrivalDateTime', label: 'Llegada', render: (r: Row) => r.arrivalDateTime ? new Date(r.arrivalDateTime).toLocaleString('es-EC') : '—' },
    { key: 'estimatedDuration', label: 'Duración', render: (r: Row) => r.estimatedDuration ? `${r.estimatedDuration} min` : '—' },
  ];
  ngOnInit() {
    this.load();
    this.svc.getFlights().subscribe((d: any) => this.flights.set(d));
    this.svc.getAirports().subscribe((d: any) => this.airports.set(d));
    this.svc.getAirlines().subscribe((d: any) => this.airlines.set(d));
    this.svc.getAircraft().subscribe((d: any) => this.aircraft.set(d));
  }
  load() { this.svc.getSegments().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r, departureDateTime: toLocalInput(r.departureDateTime), arrivalDateTime: toLocalInput(r.arrivalDateTime) }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { segmentNumber: f.segmentNumber, originAirportId: f.originAirportId, destinationAirportId: f.destinationAirportId, departureDateTime: f.departureDateTime, arrivalDateTime: f.arrivalDateTime, airlineId: f.airlineId, estimatedDuration: Number(f.estimatedDuration) };
    if (f.flightId) body.flightId = f.flightId;
    if (f.aircraftId) body.aircraftId = f.aircraftId;
    const obs = f.id ? this.svc.updateSegment(f.id, body) : this.svc.createSegment(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error('Error segmento:', err); this.saving.set(false); } });
  }
  del(id: string) { this.svc.deleteSegment(id).subscribe(() => this.load()); }
}
