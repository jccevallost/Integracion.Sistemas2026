import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; modelName: string; registration: string; airlineId: string; totalSeats?: number; hasWifi?: boolean; hasUsb?: boolean; airline?: { name: string } };
type Airline = { id: string; name: string; iataCode: string };
const empty = (): Partial<Row> => ({ modelName: '', registration: '', airlineId: '', totalSeats: undefined, hasWifi: false, hasUsb: false });

@Component({ selector: 'app-admin-aircraft', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Aeronaves" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['modelName','registration']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Aeronave' : 'Nueva Aeronave'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
        <input [(ngModel)]="form().modelName" required placeholder="Boeing 737-800" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Matrícula *</label>
        <input [(ngModel)]="form().registration" required placeholder="HC-CNA" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aerolínea *</label>
        <select [(ngModel)]="form().airlineId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona una aerolínea —</option>
          <option *ngFor="let a of airlines()" [value]="a.id">{{ a.name }} ({{ a.iataCode }})</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Total Asientos</label>
        <input [(ngModel)]="form().totalSeats" type="number" min="1" max="900" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div class="flex gap-4 items-center pt-1">
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input [(ngModel)]="form().hasWifi" type="checkbox" class="rounded" /> WiFi a bordo
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input [(ngModel)]="form().hasUsb" type="checkbox" class="rounded" /> Puertos USB
        </label>
      </div>
    </app-admin-form-modal>`,
})
export class AdminAircraftComponent implements OnInit {
  private svc = inject(AdminService);
  rows     = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal    = signal(false); form = signal<Partial<Row>>(empty());
  airlines = signal<Airline[]>([]);
  cols = [
    { key: 'modelName', label: 'Modelo', render: (r: Row) => r.modelName },
    { key: 'registration', label: 'Matrícula', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.registration}</span>` },
    { key: 'airline', label: 'Aerolínea', render: (r: Row) => r.airline?.name ?? '—' },
    { key: 'totalSeats', label: 'Asientos', render: (r: Row) => String(r.totalSeats ?? '—') },
  ];
  ngOnInit() {
    this.load();
    this.svc.getAirlines().subscribe((d: any) => this.airlines.set(d));
  }
  load() { this.svc.getAircraft().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) { e.preventDefault(); this.saving.set(true); const { id, airline, ...body } = this.form() as any;
    const obs = id ? this.svc.updateAircraft(id, body) : this.svc.createAircraft(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteAircraft(id).subscribe(() => this.load()); }
}
