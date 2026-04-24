import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; passengerId: string; segmentId: string; boardingCode: string; gate?: string; boardingGroup?: string; checkInAt?: string; status?: string };
const empty = (): Partial<Row> => ({ passengerId: '', segmentId: '', boardingCode: '', gate: '', boardingGroup: '', status: 'NOT_CHECKED_IN' });

@Component({ selector: 'app-admin-boarding-passes', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Pases de Abordar" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['boardingCode','gate']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Pase' : 'Nuevo Pase'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Passenger ID *</label>
        <input [(ngModel)]="form().passengerId" required placeholder="UUID del pasajero" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Segment ID *</label>
        <input [(ngModel)]="form().segmentId" required placeholder="UUID del segmento" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Código de Embarque *</label>
        <input [(ngModel)]="form().boardingCode" required placeholder="BP-ABCD-1234" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Puerta</label>
        <input [(ngModel)]="form().gate" placeholder="A12" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
        <input [(ngModel)]="form().boardingGroup" placeholder="A" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select [(ngModel)]="form().status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
          <option value="NOT_CHECKED_IN">NOT_CHECKED_IN</option>
          <option value="CHECKED_IN">CHECKED_IN</option>
          <option value="BOARDED">BOARDED</option>
          <option value="NO_SHOW">NO_SHOW</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminBoardingPassesComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true); saving = signal(false); modal = signal(false); form = signal<Partial<Row>>(empty());
  cols = [
    { key: 'boardingCode', label: 'Código', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.boardingCode}</span>` },
    { key: 'gate', label: 'Puerta', render: (r: Row) => r.gate ?? '—' },
    { key: 'boardingGroup', label: 'Grupo', render: (r: Row) => r.boardingGroup ?? '—' },
    { key: 'status', label: 'Estado', render: (r: Row) => r.status ?? '—' },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getBoardingPasses().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { passengerId: f.passengerId, segmentId: f.segmentId, boardingCode: f.boardingCode, status: f.status };
    if (f.gate) body.gate = f.gate;
    if (f.boardingGroup) body.boardingGroup = f.boardingGroup;
    if (f.checkInAt) body.checkInAt = f.checkInAt;
    const obs = f.id ? this.svc.updateBoardingPass(f.id, body) : this.svc.createBoardingPass(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: () => this.saving.set(false) }); }
  del(id: string) { this.svc.deleteBoardingPass(id).subscribe(() => this.load()); }
}
