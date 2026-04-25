import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; passengerId: string; segmentId: string; boardingCode: string; gate?: string; boardingGroup?: string; status?: string; passenger?: { firstName: string; lastName: string }; segment?: { segmentNumber: string; originAirport?: { iataCode: string }; destinationAirport?: { iataCode: string } } };
type Passenger = { id: string; firstName: string; lastName: string; documentNumber: string; reservation?: { reservationCode: string } };
type Segment   = { id: string; segmentNumber: string; originAirport?: { iataCode: string }; destinationAirport?: { iataCode: string } };

const STATUS_LABELS: Record<string, string> = {
  NOT_CHECKED_IN: 'Sin check-in', CHECKED_IN: 'Check-in OK',
  BOARDED: 'Embarcado', NO_SHOW: 'No se presentó',
};
function genCode() { return `BP-${Math.random().toString(36).slice(2,6).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; }
const empty = (): Partial<Row> => ({ passengerId: '', segmentId: '', boardingCode: genCode(), gate: '', boardingGroup: '', status: 'NOT_CHECKED_IN' });

@Component({ selector: 'app-admin-boarding-passes', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Pases de Abordar" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['boardingCode','gate']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>

    <app-admin-form-modal [title]="form().id ? 'Editar Pase' : 'Nuevo Pase de Abordar'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Pasajero *</label>
        <select [(ngModel)]="form().passengerId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona pasajero —</option>
          <option *ngFor="let p of passengers()" [value]="p.id">
            {{ p.firstName }} {{ p.lastName }} · {{ p.documentNumber }}{{ p.reservation ? ' (' + p.reservation.reservationCode + ')' : '' }}
          </option>
        </select></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Segmento de vuelo *</label>
        <select [(ngModel)]="form().segmentId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona segmento —</option>
          <option *ngFor="let s of segments()" [value]="s.id">
            {{ s.segmentNumber }} · {{ s.originAirport?.iataCode ?? '?' }} → {{ s.destinationAirport?.iataCode ?? '?' }}
          </option>
        </select></div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Código de embarque *</label>
        <div class="flex gap-2">
          <input [(ngModel)]="form().boardingCode" required placeholder="BP-XXXX-YYYY"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" />
          <button type="button" (click)="regenCode()"
            class="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors whitespace-nowrap">↻ Nuevo código</button>
        </div></div>

      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Puerta</label>
          <input [(ngModel)]="form().gate" placeholder="A12" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Grupo de embarque</label>
          <input [(ngModel)]="form().boardingGroup" placeholder="A" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      </div>

      <div><label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
        <select [(ngModel)]="form().status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="NOT_CHECKED_IN">Sin check-in</option>
          <option value="CHECKED_IN">Check-in realizado</option>
          <option value="BOARDED">Embarcado</option>
          <option value="NO_SHOW">No se presentó</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminBoardingPassesComponent implements OnInit {
  private svc = inject(AdminService);
  rows       = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal      = signal(false); form = signal<Partial<Row>>(empty());
  passengers = signal<Passenger[]>([]); segments = signal<Segment[]>([]);

  cols = [
    { key: 'boardingCode', label: 'Código',   renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.boardingCode}</span>` },
    { key: 'passenger',    label: 'Pasajero', render: (r: Row) => r.passenger ? `${r.passenger.firstName} ${r.passenger.lastName}` : '—' },
    { key: 'segment',      label: 'Segmento', render: (r: Row) => r.segment ? `${r.segment.segmentNumber}: ${r.segment.originAirport?.iataCode ?? '?'} → ${r.segment.destinationAirport?.iataCode ?? '?'}` : '—' },
    { key: 'gate',         label: 'Puerta',   render: (r: Row) => r.gate ?? '—' },
    { key: 'boardingGroup',label: 'Grupo',    render: (r: Row) => r.boardingGroup ?? '—' },
    { key: 'status',       label: 'Estado',   render: (r: Row) => STATUS_LABELS[r.status ?? ''] ?? r.status ?? '—' },
  ];

  ngOnInit() {
    this.load();
    this.svc.getReservationPassengers().subscribe((d: any) => this.passengers.set(d));
    this.svc.getSegments().subscribe((d: any) => this.segments.set(d));
  }

  load() { this.svc.getBoardingPasses().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  regenCode() { this.form.set({ ...this.form(), boardingCode: genCode() }); }

  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { passengerId: f.passengerId, segmentId: f.segmentId, boardingCode: f.boardingCode, status: f.status };
    if (f.gate)          body.gate          = f.gate;
    if (f.boardingGroup) body.boardingGroup = f.boardingGroup;
    const obs = f.id ? this.svc.updateBoardingPass(f.id, body) : this.svc.createBoardingPass(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error('Error pase:', err); this.saving.set(false); } });
  }
  del(id: string) { this.svc.deleteBoardingPass(id).subscribe(() => this.load()); }
}
