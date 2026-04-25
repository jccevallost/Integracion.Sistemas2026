import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; serviceId: string; airlineId: string; originAirportId?: string; destAirportId?: string; price: number; currency: string; service?: { name: string; code: string }; airline?: { name: string; iataCode: string } };
type Service  = { id: string; name: string; code: string; category: string };
type Airline  = { id: string; name: string; iataCode: string };
type Airport  = { id: string; iataCode: string; name: string };
const empty = (): Partial<Row> => ({ serviceId: '', airlineId: '', originAirportId: '', destAirportId: '', price: 0, currency: 'USD' });

@Component({ selector: 'app-admin-airline-service-configs', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Precios de Servicios por Aerolínea" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['currency']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Config. Servicio' : 'Nueva Config. Servicio'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Servicio *</label>
        <select [(ngModel)]="form().serviceId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona servicio —</option>
          <option *ngFor="let s of services()" [value]="s.id">{{ s.name }} ({{ s.code }})</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aerolínea *</label>
        <select [(ngModel)]="form().airlineId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona aerolínea —</option>
          <option *ngFor="let a of airlines()" [value]="a.id">{{ a.name }} ({{ a.iataCode }})</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aeropuerto Origen (opcional)</label>
        <select [(ngModel)]="form().originAirportId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Cualquier origen —</option>
          <option *ngFor="let a of airports()" [value]="a.id">{{ a.iataCode }} — {{ a.name }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aeropuerto Destino (opcional)</label>
        <select [(ngModel)]="form().destAirportId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Cualquier destino —</option>
          <option *ngFor="let a of airports()" [value]="a.id">{{ a.iataCode }} — {{ a.name }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
        <input [(ngModel)]="form().price" required type="number" min="0" step="0.01" placeholder="25.00" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
        <select [(ngModel)]="form().currency" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="USD">USD</option><option value="EUR">EUR</option><option value="COP">COP</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminAirlineServiceConfigsComponent implements OnInit {
  private svc = inject(AdminService);
  rows     = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal    = signal(false); form = signal<Partial<Row>>(empty());
  services = signal<Service[]>([]); airlines = signal<Airline[]>([]); airports = signal<Airport[]>([]);
  cols = [
    { key: 'service',  label: 'Servicio',   render: (r: Row) => r.service?.name ?? '—' },
    { key: 'airline',  label: 'Aerolínea',  render: (r: Row) => r.airline ? `${r.airline.name} (${r.airline.iataCode})` : '—' },
    { key: 'price',    label: 'Precio',     render: (r: Row) => `$${(+r.price).toFixed(2)} ${r.currency}` },
  ];
  ngOnInit() {
    this.load();
    this.svc.getServices().subscribe((d: any) => this.services.set(d));
    this.svc.getAirlines().subscribe((d: any) => this.airlines.set(d));
    this.svc.getAirports().subscribe((d: any) => this.airports.set(d));
  }
  load() { this.svc.getAirlineServiceConfigs().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { serviceId: f.serviceId, airlineId: f.airlineId, price: Number(f.price), currency: f.currency || 'USD' };
    if (f.originAirportId) body.originAirportId = f.originAirportId;
    if (f.destAirportId)   body.destAirportId   = f.destAirportId;
    const obs = f.id ? this.svc.updateAirlineServiceConfig(f.id, body) : this.svc.createAirlineServiceConfig(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error(err); this.saving.set(false); } }); }
  del(id: string) { this.svc.deleteAirlineServiceConfig(id).subscribe(() => this.load()); }
}
