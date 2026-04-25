import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminFormModalComponent } from '../../../shared/components/admin-form-modal/admin-form-modal.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { airlineId: string; airportId: string; airline?: { name: string; iataCode: string }; airport?: { iataCode: string; name: string } };
type Airline = { id: string; name: string; iataCode: string };
type Airport = { id: string; iataCode: string; name: string };
const empty = () => ({ airlineId: '', airportId: '' });

@Component({ selector: 'app-admin-airline-airports', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent, AdminFormModalComponent],
  template: `
    <app-admin-table title="Aeropuertos por Aerolínea" [data]="tableRows()" [columns]="cols" [isLoading]="loading()" [isDeleting]="saving()"
      [searchKeys]="[]" (onAdd)="openCreate()" (onDelete)="del($event)"/>
    <app-admin-form-modal title="Nueva Relación Aerolínea-Aeropuerto" [open]="modal()" [isLoading]="saving()"
      (onClose)="modal.set(false)" (onSubmit)="save($event)">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aerolínea *</label>
        <select [(ngModel)]="form().airlineId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona aerolínea —</option>
          <option *ngFor="let a of airlines()" [value]="a.id">{{ a.name }} ({{ a.iataCode }})</option>
        </select></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Aeropuerto *</label>
        <select [(ngModel)]="form().airportId" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
          <option value="">— Selecciona aeropuerto —</option>
          <option *ngFor="let a of airports()" [value]="a.id">{{ a.iataCode }} — {{ a.name }}</option>
        </select></div>
    </app-admin-form-modal>`,
})
export class AdminAirlineAirportsComponent implements OnInit {
  private svc  = inject(AdminService);
  rows      = signal<Row[]>([]); loading = signal(true); saving = signal(false);
  modal     = signal(false); form = signal(empty());
  airlines  = signal<Airline[]>([]); airports = signal<Airport[]>([]);
  tableRows = signal<any[]>([]);
  cols = [
    { key: 'airline', label: 'Aerolínea', render: (r: any) => r.airline ? `${r.airline.name} (${r.airline.iataCode})` : '—' },
    { key: 'airport', label: 'Aeropuerto', render: (r: any) => r.airport ? `${r.airport.iataCode} — ${r.airport.name}` : '—' },
  ];
  ngOnInit() {
    this.load();
    this.svc.getAirlines().subscribe((d: any) => this.airlines.set(d));
    this.svc.getAirports().subscribe((d: any) => this.airports.set(d));
  }
  load() {
    this.svc.getAirlineAirports().subscribe({
      next: (d: any) => {
        this.rows.set(d);
        this.tableRows.set(d.map((r: Row) => ({ ...r, id: `${r.airlineId}___${r.airportId}` })));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
  openCreate() { this.form.set(empty()); this.modal.set(true); }
  save(e: Event) {
    e.preventDefault(); this.saving.set(true);
    const f = this.form();
    this.svc.createAirlineAirport({ airlineId: f.airlineId, airportId: f.airportId }).subscribe({
      next: () => { this.modal.set(false); this.saving.set(false); this.load(); },
      error: (err: any) => { console.error(err); this.saving.set(false); },
    });
  }
  del(syntheticId: string) {
    const [airlineId, airportId] = syntheticId.split('___');
    this.svc.deleteAirlineAirport(airlineId, airportId).subscribe(() => this.load());
  }
}
