import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; name: string; countryId: string; iataCode?: string; country?: { name: string } };
type Country = { id: string; name: string; isoCode: string };
const empty = (): Partial<Row> => ({ name: '', countryId: '', iataCode: '' });

@Component({ selector: 'app-admin-cities', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Ciudades" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['name']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Ciudad' : 'Nueva Ciudad'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input [(ngModel)]="form().name" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">País *</label>
        <select [(ngModel)]="form().countryId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona un país —</option>
          <option *ngFor="let c of countries()" [value]="c.id">{{ c.name }} ({{ c.isoCode }})</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Código IATA</label>
        <input [(ngModel)]="form().iataCode" maxlength="3" placeholder="UIO" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminCitiesComponent implements OnInit {
  private svc = inject(AdminService);
  rows      = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal     = signal(false); form = signal<Partial<Row>>(empty());
  countries = signal<Country[]>([]);
  cols = [
    { key: 'name', label: 'Ciudad', render: (r: Row) => r.name },
    { key: 'country', label: 'País', render: (r: Row) => r.country?.name ?? '—' },
    { key: 'iataCode', label: 'IATA', render: (r: Row) => r.iataCode ?? '—' },
  ];
  ngOnInit() {
    this.load();
    this.svc.getCountries().subscribe((d: any) => this.countries.set(d));
  }
  load() { this.svc.getCities().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, country, ...body } = this.form() as any;
    const obs = id ? this.svc.updateCity(id, body) : this.svc.createCity(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteCity(id).subscribe(() => this.load()); }
}
