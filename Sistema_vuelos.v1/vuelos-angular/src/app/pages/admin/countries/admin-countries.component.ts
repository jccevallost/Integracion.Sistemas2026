import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; name: string; isoCode: string; phoneCode?: string; currencyCode?: string };
const empty = (): Partial<Row> => ({ name: '', isoCode: '', phoneCode: '', currencyCode: '' });

@Component({ selector: 'app-admin-countries', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Países" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['name','isoCode']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar País' : 'Nuevo País'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input [(ngModel)]="form().name" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Código ISO *</label>
        <input [(ngModel)]="form().isoCode" maxlength="2" placeholder="CO" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Cód. Telefónico</label>
        <input [(ngModel)]="form().phoneCode" placeholder="+57" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
        <input [(ngModel)]="form().currencyCode" maxlength="3" placeholder="COP" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminCountriesComponent implements OnInit {
  private svc = inject(AdminService);
  rows    = signal<Row[]>([]);
  loading = signal(true);
  saving  = signal(false);
  modal   = signal(false);
  form    = signal<Partial<Row>>(empty());
  cols = [
    { key: 'isoCode', label: 'ISO', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.isoCode}</span>` },
    { key: 'name', label: 'Nombre', render: (r: Row) => r.name },
    { key: 'phoneCode', label: 'Cód. Tel.', render: (r: Row) => r.phoneCode || '—' },
    { key: 'currencyCode', label: 'Moneda', render: (r: Row) => r.currencyCode || '—' },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getCountries().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { name: f.name, isoCode: f.isoCode };
    if (f.phoneCode) body.phoneCode = f.phoneCode;
    if (f.currencyCode) body.currencyCode = f.currencyCode;
    const obs = f.id ? this.svc.updateCountry(f.id, body) : this.svc.createCountry(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteCountry(id).subscribe(() => this.load()); }
}
