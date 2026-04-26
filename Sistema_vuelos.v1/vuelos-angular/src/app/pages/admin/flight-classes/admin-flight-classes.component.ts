import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; flightId: string; cabinClass: string; basePrice: number; availableSeats: number; flight?: { originAirportIata?: string; destinationAirportIata?: string } };
type Flight = { id: string; flightNumber?: string; originAirportIata?: string; destinationAirportIata?: string; airline?: { name: string; iataCode: string } };
const empty = (): Partial<Row> => ({ flightId: '', cabinClass: 'ECONOMY', basePrice: 0, availableSeats: 0 });

@Component({ selector: 'app-admin-flight-classes', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Clases de Vuelo" [data]="rows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="['cabinClass']" (onAdd)="openCreate()" (onEdit)="openEdit($event)" (onDelete)="del($event)"/>
    <app-admin-form-modal [title]="form().id ? 'Editar Clase' : 'Nueva Clase'" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      @if (errorMsg()) {
        <div class="px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{{ errorMsg() }}</div>
      }
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Vuelo *</label>
        <select [(ngModel)]="form().flightId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona un vuelo —</option>
          <option *ngFor="let f of flights()" [value]="f.id">{{ flightLabel(f) }}</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Clase *</label>
        <select [(ngModel)]="form().cabinClass" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="ECONOMY">Económica</option>
          <option value="PREMIUM_ECONOMY">Premium Económica</option>
          <option value="BUSINESS">Business</option>
          <option value="FIRST">Primera clase</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Precio Base ($) *</label>
        <input [(ngModel)]="form().basePrice" required type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Asientos Disponibles *</label>
        <input [(ngModel)]="form().availableSeats" required type="number" min="0" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
    </app-admin-form-modal>`,
})
export class AdminFlightClassesComponent implements OnInit {
  private svc = inject(AdminService);
  rows     = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal    = signal(false); form = signal<Partial<Row>>(empty());
  flights  = signal<Flight[]>([]);
  errorMsg = signal('');
  cols = [
    { key: 'flight', label: 'Vuelo', render: (r: Row) => r.flight ? `${r.flight.originAirportIata ?? '?'} → ${r.flight.destinationAirportIata ?? '?'}` : '—' },
    { key: 'cabinClass', label: 'Clase', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.cabinClass}</span>` },
    { key: 'basePrice', label: 'Precio', render: (r: Row) => `\$${r.basePrice}` },
    { key: 'seats', label: 'Disponibles', render: (r: Row) => String(r.availableSeats ?? 0) },
  ];
  flightLabel(f: Flight): string {
    const route = `${f.originAirportIata ?? '?'} → ${f.destinationAirportIata ?? '?'}`;
    const airline = f.airline ? ` · ${f.airline.iataCode}` : '';
    const num = f.flightNumber ? ` (${f.flightNumber})` : '';
    return `${route}${num}${airline}`;
  }
  ngOnInit() {
    this.load();
    this.svc.getFlights().subscribe((d: any) => this.flights.set(d));
  }
  load() { this.svc.getFlightClasses().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openCreate() { this.form.set(empty()); this.errorMsg.set(''); this.modal.set(true); }
  openEdit(r: Row) { this.form.set({ ...r }); this.errorMsg.set(''); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true); this.errorMsg.set('');
    const f = this.form() as any;
    const body = { flightId: f.flightId, cabinClass: f.cabinClass, basePrice: f.basePrice, availableSeats: f.availableSeats };
    const obs = f.id ? this.svc.updateFlightClass(f.id, body) : this.svc.createFlightClass(body);
    obs.subscribe({
      next: () => { this.modal.set(false); this.saving.set(false); this.load(); },
      error: (err: any) => {
        this.saving.set(false);
        if (err.status === 409) {
          this.errorMsg.set(`Ya existe una clase "${f.cabinClass}" para este vuelo. Elige una clase diferente o edita la existente.`);
        } else {
          this.errorMsg.set('Error al guardar. Inténtalo de nuevo.');
        }
      },
    });
  }
  del(id: string) { this.svc.deleteFlightClass(id).subscribe(() => this.load()); }
}
