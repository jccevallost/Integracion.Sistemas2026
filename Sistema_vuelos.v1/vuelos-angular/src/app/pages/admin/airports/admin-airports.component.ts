import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; iataCode: string; name: string; cityId: string; timezone: string; city?: { name: string } };
type City = { id: string; name: string; country?: { name: string } };
const empty = (): Partial<Row> => ({ iataCode: '', name: '', cityId: '', timezone: 'America/Guayaquil' });

const TIMEZONES = [
  'America/Guayaquil','America/Bogota','America/Lima','America/Santiago',
  'America/New_York','America/Los_Angeles','America/Mexico_City','Europe/Madrid',
  'America/Buenos_Aires','America/Caracas','America/La_Paz',
];

@Component({ selector: 'app-admin-airports', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Aeropuertos" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['name','iataCode']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Aeropuerto' : 'Nuevo Aeropuerto'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Código IATA *</label>
        <input [(ngModel)]="form().iataCode" maxlength="3" required placeholder="UIO" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input [(ngModel)]="form().name" required placeholder="Aeropuerto Internacional Mariscal Sucre" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
        <select [(ngModel)]="form().cityId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona una ciudad —</option>
          <option *ngFor="let c of cities()" [value]="c.id">{{ c.name }}{{ c.country ? ' · ' + c.country.name : '' }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Zona horaria *</label>
        <select [(ngModel)]="form().timezone" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option *ngFor="let tz of timezones" [value]="tz">{{ tz }}</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminAirportsComponent implements OnInit {
  private svc = inject(AdminService);
  rows   = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal  = signal(false); form = signal<Partial<Row>>(empty());
  cities = signal<City[]>([]);
  timezones = TIMEZONES;
  cols = [
    { key: 'iataCode', label: 'IATA', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.iataCode}</span>` },
    { key: 'name', label: 'Nombre', render: (r: Row) => r.name },
    { key: 'city', label: 'Ciudad', render: (r: Row) => r.city?.name ?? '—' },
    { key: 'timezone', label: 'Timezone', render: (r: Row) => r.timezone },
  ];
  ngOnInit() {
    this.load();
    this.svc.getCities().subscribe((d: any) => this.cities.set(d));
  }
  load() { this.svc.getAirports().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body = { iataCode: (f.iataCode ?? '').toUpperCase(), name: f.name, cityId: f.cityId, timezone: f.timezone };
    const obs = f.id ? this.svc.updateAirport(f.id, body) : this.svc.createAirport(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteAirport(id).subscribe(() => this.load()); }
}
