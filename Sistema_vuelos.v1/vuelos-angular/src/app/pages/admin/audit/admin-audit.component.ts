import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminTableComponent } from '../../../shared/components/admin-table/admin-table.component';
import { AdminService } from '../../../core/services/admin.service';

type Row = { id: string; action: string; entityType: string; entityId?: string; userId?: string; createdAt: string; user?: { firstName: string; lastName: string } };

@Component({ selector: 'app-admin-audit', standalone: true, imports: [CommonModule, FormsModule, AdminTableComponent],
  template: `
    <app-admin-table title="Auditoría" [data]="rows()" [columns]="cols" [isLoading]="loading()"
      [searchKeys]="['action','entityType']"/>`,
})
export class AdminAuditComponent implements OnInit {
  private svc = inject(AdminService);
  rows = signal<Row[]>([]); loading = signal(true);
  cols = [
    { key: 'createdAt', label: 'Fecha', render: (r: Row) => new Date(r.createdAt).toLocaleString('es-EC') },
    { key: 'user', label: 'Usuario', render: (r: Row) => r.user ? `${r.user.firstName} ${r.user.lastName}` : '—' },
    { key: 'action', label: 'Acción', renderHtml: (r: Row) => `<span class="font-mono font-bold text-blue-600">${r.action}</span>` },
    { key: 'entityType', label: 'Entidad', render: (r: Row) => r.entityType },
    { key: 'entityId', label: 'ID Entidad', render: (r: Row) => r.entityId ? r.entityId.slice(0, 8) + '…' : '—' },
  ];
  ngOnInit() { this.load(); }
  load() { this.svc.getAuditLogs().subscribe({ next: (d: any) => { this.rows.set(d); this.loading.set(false); }, error: () => this.loading.set(false) }); }
}
