import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; userId: string; taxId: string; businessName: string; email?: string; address: string; cityId: string; isDefault: boolean; city?: { name: string } };
type User = { id: string; email: string; firstName: string; firstLastName: string };
type City = { id: string; name: string; country?: { name: string } };
const empty = (): Partial<Row> => ({ userId: '', taxId: '', businessName: '', email: '', address: '', cityId: '', isDefault: false });

@Component({ selector: 'app-admin-billing-profiles', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Perfiles de Facturación" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['businessName','taxId']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Perfil' : 'Nuevo Perfil'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
        <select [(ngModel)]="form().userId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona usuario —</option>
          <option *ngFor="let u of users()" [value]="u.id">{{ u.firstName }} {{ u.firstLastName }} — {{ u.email }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">RUC / Cédula *</label>
        <input [(ngModel)]="form().taxId" required placeholder="0910000000001" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón Social *</label>
        <input [(ngModel)]="form().businessName" required placeholder="Juan Pérez" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Email de facturación</label>
        <input [(ngModel)]="form().email" type="email" placeholder="facturacion@ejemplo.com" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
        <input [(ngModel)]="form().address" required placeholder="Av. Principal 123" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
        <select [(ngModel)]="form().cityId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona ciudad —</option>
          <option *ngFor="let c of cities()" [value]="c.id">{{ c.name }}{{ c.country ? ' · ' + c.country.name : '' }}</option>
        </select></div>
      <div class="flex items-center gap-2">
        <input type="checkbox" [(ngModel)]="form().isDefault" id="isDefault" class="rounded border-gray-300" />
        <label for="isDefault" class="text-sm font-medium text-gray-700">Perfil predeterminado</label></div>
    </app-admin-form-modal>`,
})
export class AdminBillingProfilesComponent implements OnInit {
  private svc = inject(AdminService);
  rows   = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal  = signal(false); form = signal<Partial<Row>>(empty());
  users  = signal<User[]>([]); cities = signal<City[]>([]);
  cols = [
    { key: 'businessName', label: 'Razón Social', render: (r: Row) => r.businessName },
    { key: 'taxId',        label: 'RUC/Cédula',   render: (r: Row) => r.taxId },
    { key: 'city',         label: 'Ciudad',        render: (r: Row) => r.city?.name ?? '—' },
    { key: 'isDefault',    label: 'Predeterminado',render: (r: Row) => r.isDefault ? '✓' : '' },
  ];
  ngOnInit() {
    this.load();
    this.svc.getUsers().subscribe((d: any) => this.users.set(d));
    this.svc.getCities().subscribe((d: any) => this.cities.set(d));
  }
  load() { this.svc.getBillingProfiles().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { userId: f.userId, taxId: f.taxId, businessName: f.businessName, address: f.address, cityId: f.cityId, isDefault: !!f.isDefault };
    if (f.email) body.email = f.email;
    const obs = f.id ? this.svc.updateBillingProfile(f.id, body) : this.svc.createBillingProfile(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error(err); this.saving.set(false); } }); }
  del(id: string) { this.svc.deleteBillingProfile(id).subscribe(() => this.load()); }
}
