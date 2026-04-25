import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; passengerId: string; serviceConfigId: string; quantity: number; unitPriceAtBooking: number; passenger?: { firstName: string; lastName: string }; serviceConfig?: { service?: { name: string }; price: number } };
type Passenger = { id: string; firstName: string; lastName: string; documentNumber: string; reservation?: { reservationCode: string } };
type ServiceConfig = { id: string; price: number; currency: string; service?: { name: string; code: string }; airline?: { name: string } };
const empty = (): Partial<Row> => ({ passengerId: '', serviceConfigId: '', quantity: 1, unitPriceAtBooking: 0 });

@Component({ selector: 'app-admin-passenger-services', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Servicios por Pasajero" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="[]" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Servicio' : 'Nuevo Servicio'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Pasajero *</label>
        <select [(ngModel)]="form().passengerId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona pasajero —</option>
          <option *ngFor="let p of passengers()" [value]="p.id">{{ p.firstName }} {{ p.lastName }} — {{ p.documentNumber }}{{ p.reservation ? ' (' + p.reservation.reservationCode + ')' : '' }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Servicio (configuración) *</label>
        <select [(ngModel)]="form().serviceConfigId" required (ngModelChange)="onConfigChange($event)" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona servicio —</option>
          <option *ngFor="let c of serviceConfigs()" [value]="c.id">{{ c.service?.name ?? c.id }} · {{ c.airline?.name }} · $ {{ (+c.price).toFixed(2) }} {{ c.currency }}</option>
        </select></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
          <input [(ngModel)]="form().quantity" required type="number" min="1" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Precio al reservar *</label>
          <input [(ngModel)]="form().unitPriceAtBooking" required type="number" min="0" step="0.01" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      </div>
    </app-admin-form-modal>`,
})
export class AdminPassengerServicesComponent implements OnInit {
  private svc = inject(AdminService);
  rows          = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal         = signal(false); form = signal<Partial<Row>>(empty());
  passengers    = signal<Passenger[]>([]); serviceConfigs = signal<ServiceConfig[]>([]);
  cols = [
    { key: 'passenger',     label: 'Pasajero',  render: (r: Row) => r.passenger ? `${r.passenger.firstName} ${r.passenger.lastName}` : '—' },
    { key: 'serviceConfig', label: 'Servicio',  render: (r: Row) => r.serviceConfig?.service?.name ?? '—' },
    { key: 'quantity',      label: 'Qty',        render: (r: Row) => String(r.quantity) },
    { key: 'unitPriceAtBooking', label: 'P. Unit.', render: (r: Row) => `$${(+r.unitPriceAtBooking).toFixed(2)}` },
  ];
  ngOnInit() {
    this.load();
    this.svc.getReservationPassengers().subscribe((d: any) => this.passengers.set(d));
    this.svc.getAirlineServiceConfigs().subscribe((d: any) => this.serviceConfigs.set(d));
  }
  onConfigChange(configId: string) {
    const cfg = this.serviceConfigs().find(c => c.id === configId);
    if (cfg) this.form.set({ ...this.form(), unitPriceAtBooking: +cfg.price });
  }
  load() { this.svc.getPassengerServices().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body = { passengerId: f.passengerId, serviceConfigId: f.serviceConfigId, quantity: Number(f.quantity), unitPriceAtBooking: Number(f.unitPriceAtBooking) };
    const obs = f.id ? this.svc.updatePassengerService(f.id, body) : this.svc.createPassengerService(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error(err); this.saving.set(false); } }); }
  del(id: string) { this.svc.deletePassengerService(id).subscribe(() => this.load()); }
}
