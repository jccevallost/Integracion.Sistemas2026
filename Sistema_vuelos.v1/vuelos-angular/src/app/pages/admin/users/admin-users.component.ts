import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; firstName: string; lastName: string; email: string; role: string; phone?: string; documentType?: string; documentNumber?: string; isActive?: boolean };
const empty = (): Partial<Row> => ({ firstName: '', lastName: '', email: '', role: 'CUSTOMER', isActive: true });

@Component({ selector: 'app-admin-users', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Usuarios" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['firstName','lastName','email']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Usuario' : 'Nuevo Usuario'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input [(ngModel)]="form().firstName" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
        <input [(ngModel)]="form().lastName" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input [(ngModel)]="form().email" required type="email" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
        <select [(ngModel)]="form().role" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="ADMIN">ADMIN</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
        <input [(ngModel)]="form().phone" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div class="pt-1"><label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input [(ngModel)]="form().isActive" type="checkbox" class="rounded" /> Activo
      </label></div>
    </app-admin-form-modal>`,
})
export class AdminUsersComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'name', label: 'Nombre', render: (r: Row) => `${r.firstName} ${r.lastName}` },
    { key: 'email', label: 'Email', render: (r: Row) => r.email },
    { key: 'role', label: 'Rol', renderHtml: (r: Row) => `<span class="font-mono font-bold ${r.role === 'ADMIN' ? 'text-purple-600' : 'text-blue-600'}">${r.role}</span>` },
    { key: 'isActive', label: 'Activo', render: (r: Row) => r.isActive ? 'Sí' : 'No' },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getUsers().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, ...body } = this.form() as Row;
    const obs = id ? this.svc.updateUser(id, body) : this.svc.createUser(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteUser(id).subscribe(() => this.load()); }
}
