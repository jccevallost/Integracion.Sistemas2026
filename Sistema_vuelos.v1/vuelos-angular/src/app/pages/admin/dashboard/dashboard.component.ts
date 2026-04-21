import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';

const CARDS = [
  { label: 'Vuelos',     path: '/admin/flights',      color: 'bg-blue-50 border-blue-200 text-blue-600' },
  { label: 'Reservas',   path: '/admin/reservations', color: 'bg-green-50 border-green-200 text-green-600' },
  { label: 'Usuarios',   path: '/admin/users',        color: 'bg-purple-50 border-purple-200 text-purple-600' },
  { label: 'Pagos',      path: '/admin/payments',     color: 'bg-yellow-50 border-yellow-200 text-yellow-600' },
  { label: 'Aeropuertos',path: '/admin/airports',     color: 'bg-orange-50 border-orange-200 text-orange-600' },
  { label: 'Promociones',path: '/admin/promotions',   color: 'bg-pink-50 border-pink-200 text-pink-600' },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
      <p class="text-sm text-gray-500 mb-8">Bienvenido, {{ auth.user()?.firstName }}. Panel de administración.</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <a *ngFor="let c of cards" [routerLink]="c.path"
          [class]="'border rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer ' + c.color">
          <p class="text-lg font-bold">{{ c.label }}</p>
          <p class="text-xs opacity-70 mt-1">Gestionar →</p>
        </a>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  auth  = inject(AuthStore);
  cards = CARDS;
}
