import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  render?: (row: T) => string;
  renderHtml?: (row: T) => string;
}

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
        <button *ngIf="onAdd.observed" (click)="onAdd.emit()"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Agregar
        </button>
      </div>

      <div *ngIf="searchKeys.length > 0" class="relative mb-4">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
        <input [(ngModel)]="search" placeholder="Buscar..."
          class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div *ngIf="isLoading" class="flex items-center justify-center py-16">
          <svg class="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
        <div *ngIf="!isLoading && filtered.length === 0" class="text-center py-16 text-gray-400 text-sm">Sin registros</div>

        <div *ngIf="!isLoading && filtered.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th *ngFor="let col of columns" class="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wide">{{ col.label }}</th>
                <th *ngIf="onEdit.observed || onDelete.observed" class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let row of filtered" class="hover:bg-gray-50 transition-colors">
                <td *ngFor="let col of columns" class="px-4 py-3 text-gray-700">
                  <span *ngIf="col.renderHtml" [innerHTML]="col.renderHtml!(row)"></span>
                  <span *ngIf="!col.renderHtml">{{ col.render ? col.render(row) : (row[col.key] ?? '—') }}</span>
                </td>
                <td *ngIf="onEdit.observed || onDelete.observed" class="px-4 py-3">
                  <div class="flex items-center gap-2 justify-end">
                    <button *ngIf="onEdit.observed" (click)="onEdit.emit(row)" class="text-gray-400 hover:text-blue-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button *ngIf="onDelete.observed" (click)="confirmDelete(row.id)" [disabled]="isDeleting"
                      class="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class AdminTableComponent {
  @Input() title = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() isLoading = false;
  @Input() isDeleting = false;
  @Input() searchKeys: string[] = [];

  @Output() onAdd    = new EventEmitter<void>();
  @Output() onEdit   = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<string>();

  search = '';

  get filtered(): any[] {
    if (!this.search) return this.data ?? [];
    const q = this.search.toLowerCase();
    return (this.data ?? []).filter(row =>
      this.searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q))
    );
  }

  confirmDelete(id: string) {
    if (confirm('¿Eliminar este registro?')) this.onDelete.emit(id);
  }
}
