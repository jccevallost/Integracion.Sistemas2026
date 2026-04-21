import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; code: string; discountType: string; discountValue: number; maxUses?: number; usedCount?: number; expiresAt?: string; isActive?: boolean };
const empty = (): Partial<Row> => ({ code: '', discountType: 'PERCENTAGE', discountValue: 0, maxUses: undefined, isActive: true });

@Component({ selector: 'app-admin-promotions', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Promociones" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['code']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Promoción' : 'Nueva Promoción'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Código *</label>
        <input [(ngModel)]="form().code" required placeholder="VERANO20" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento</label>
        <select [(ngModel)]="form().discountType" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="PERCENTAGE">PERCENTAGE</option>
          <option value="FIXED">FIXED</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
        <input [(ngModel)]="form().discountValue" required type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Máx. Usos</label>
        <input [(ngModel)]="form().maxUses" type="number" min="0" placeholder="Sin límite" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Expira</label>
        <input [(ngModel)]="form().expiresAt" type="datetime-local" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div class="pt-1"><label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input [(ngModel)]="form().isActive" type="checkbox" class="rounded" /> Activa
      </label></div>
    </app-admin-form-modal>`,
})
export class AdminPromotionsComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'code', label: 'Código', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.code}</span>` },
    { key: 'discountType', label: 'Tipo', render: (r: Row) => r.discountType },
    { key: 'discountValue', label: 'Valor', render: (r: Row) => r.discountType === 'PERCENTAGE' ? `${r.discountValue}%` : `$${r.discountValue}` },
    { key: 'isActive', label: 'Activa', render: (r: Row) => r.isActive ? 'Sí' : 'No' },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getPromotions().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, ...body } = this.form() as Row;
    const obs = id ? this.svc.updatePromotion(id, body) : this.svc.createPromotion(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deletePromotion(id).subscribe(() => this.load()); }
}
