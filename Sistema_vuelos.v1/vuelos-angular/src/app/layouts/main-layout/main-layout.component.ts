import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <!-- Navbar -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-2 font-bold text-blue-600 text-lg">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
              VuelosApp
            </a>

            <!-- Nav links -->
            <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <a routerLink="/search" class="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/></svg>
                Buscar vuelos
              </a>
              <a *ngIf="auth.isAuthenticated()" routerLink="/my-trips" class="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                Mis viajes
              </a>
              <a *ngIf="auth.isAdmin()" routerLink="/admin" class="flex items-center gap-1.5 hover:text-purple-600 transition-colors text-purple-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Admin
              </a>
            </nav>

            <!-- Auth -->
            <div class="flex items-center gap-3">
              <ng-container *ngIf="auth.isAuthenticated(); else guestBtns">
                <div class="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                    {{ auth.user()?.firstName?.charAt(0)?.toUpperCase() }}
                  </div>
                  <span>{{ auth.user()?.firstName }}</span>
                </div>
                <button (click)="logout()" class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  <span class="hidden sm:inline">Salir</span>
                </button>
              </ng-container>
              <ng-template #guestBtns>
                <a routerLink="/login" class="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Iniciar sesión</a>
                <a routerLink="/register" class="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Registrarse</a>
              </ng-template>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenido -->
      <main class="flex-1"><router-outlet /></main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        VuelosApp © {{ year }} · Plataforma académica
      </footer>
    </div>
  `,
})
export class MainLayoutComponent {
  auth   = inject(AuthStore);
  router = inject(Router);
  year   = new Date().getFullYear();

  logout() {
    this.auth.clearAuth();
    this.router.navigate(['/login']);
  }
}
