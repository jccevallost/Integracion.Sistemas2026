import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; reservationId: string; flightClassId: string; firstName: string; lastName: string; documentNumber: string; seatNumber?: string; reservation?: { reservationCode: string }; flightClass?: { cabinClass: string } };
type Reservation = { id: string; reservationCode: string; totalAmount: number };
type FlightClass  = { id: string; cabinClass: string; flight?: { originAirportIata: string; destinationAirportIata: string } };
const empty = (): Partial<Row> => ({ reservationId: '', flightClassId: '', firstName: '', lastName: '', documentNumber: '', seatNumber: '' });

@Component({ selector: 'app-admin-reservation-passengers', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Pasajeros por Reserva" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['firstName','lastName','documentNumber']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Pasajero' : 'Nuevo Pasajero'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Reserva *</label>
        <select [(ngModel)]="form().reservationId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona reserva —</option>
          <option *ngFor="let r of reservations()" [value]="r.id">{{ r.reservationCode }} — ${{ (+r.totalAmount).toFixed(2) }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Clase de Vuelo *</label>
        <select [(ngModel)]="form().flightClassId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona clase —</option>
          <option *ngFor="let fc of flightClasses()" [value]="fc.id">{{ fc.cabinClass }}{{ fc.flight ? ' · ' + fc.flight.originAirportIata + '→' + fc.flight.destinationAirportIata : '' }}</option>
        </select></div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input [(ngModel)]="form().firstName" required placeholder="Juan" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
          <input [(ngModel)]="form().lastName" required placeholder="Pérez" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">N° Documento *</label>
        <input [(ngModel)]="form().documentNumber" required placeholder="1234567890" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Asiento (opcional)</label>
        <input [(ngModel)]="form().seatNumber" placeholder="14A" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminReservationPassengersComponent implements OnInit {
  private svc = inject(AdminService);
  rows         = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal        = signal(false); form = signal<Partial<Row>>(empty());
  reservations = signal<Reservation[]>([]); flightClasses = signal<FlightClass[]>([]);
  cols = [
    { key: 'reservation', label: 'Reserva',    render: (r: Row) => r.reservation?.reservationCode ?? '—' },
    { key: 'firstName',   label: 'Nombre',     render: (r: Row) => `${r.firstName} ${r.lastName}` },
    { key: 'documentNumber', label: 'Documento', render: (r: Row) => r.documentNumber },
    { key: 'flightClass', label: 'Clase',      render: (r: Row) => r.flightClass?.cabinClass ?? '—' },
    { key: 'seatNumber',  label: 'Asiento',    render: (r: Row) => r.seatNumber ?? '—' },
  ];
  ngOnInit() {
    this.load();
    this.svc.getReservations().subscribe((d: any) => this.reservations.set(d));
    this.svc.getFlightClasses().subscribe((d: any) => this.flightClasses.set(d));
  }
  load() { this.svc.getReservationPassengers().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form() as any;
    const body: any = { reservationId: f.reservationId, flightClassId: f.flightClassId, firstName: f.firstName, lastName: f.lastName, documentNumber: f.documentNumber };
    if (f.seatNumber) body.seatNumber = f.seatNumber;
    const obs = f.id ? this.svc.updateReservationPassenger(f.id, body) : this.svc.createReservationPassenger(body);
    obs.subscribe({ next: () => { this.modal.set(false); this.saving.set(false); this.load(); }, error: (err: any) => { console.error(err); this.saving.set(false); } }); }
  del(id: string) { this.svc.deleteReservationPassenger(id).subscribe(() => this.load()); }
}
