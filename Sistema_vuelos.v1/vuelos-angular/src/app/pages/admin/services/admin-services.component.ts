import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; name: string; code: string; category: string; description?: string };
const empty = (): Partial<Row> => ({ name: '', code: '', category: 'BAGGAGE', description: '' });

@Component({ selector: 'app-admin-services', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Catálogo de Servicios" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['name','category']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Servicio' : 'Nuevo Servicio'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
        <input [(ngModel)]="form().name" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Código *</label>
        <input [(ngModel)]="form().code" required placeholder="BAG_23KG" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select [(ngModel)]="form().category" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="BAGGAGE">BAGGAGE</option>
          <option value="MEAL">MEAL</option>
          <option value="SEAT">SEAT</option>
          <option value="LOUNGE">LOUNGE</option>
          <option value="INSURANCE">INSURANCE</option>
          <option value="OTHER">OTHER</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <input [(ngModel)]="form().description" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminServicesComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'name', label: 'Servicio', render: (r: Row) => r.name },
    { key: 'code', label: 'Código', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.code}</span>` },
    { key: 'category', label: 'Categoría', render: (r: Row) => r.category },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getServices().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { name: f.name, code: f.code, category: f.category };
    if (f.description) body.description = f.description;
    const obs = f.id ? this.svc.updateService(f.id, body) : this.svc.createService(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteService(id).subscribe(() => this.load()); }
}
