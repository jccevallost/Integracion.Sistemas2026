import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Bienvenido</h1>
            <p class="text-sm text-gray-500 mt-1">Inicia sesión para continuar</p>
          </div>

          <div *ngIf="errorMsg()" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ errorMsg() }}
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input formControlName="email" type="email" placeholder="tu@email.com"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <p *ngIf="form.get('email')?.touched && form.get('email')?.invalid" class="text-xs text-red-500 mt-1">Email inválido</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input formControlName="password" type="password" placeholder="••••••••"
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
              </div>
              <p *ngIf="form.get('password')?.touched && form.get('password')?.invalid" class="text-xs text-red-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors">
              <svg *ngIf="loading()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ loading() ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </form>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-xs font-medium text-gray-500 mb-2">Credenciales de prueba:</p>
            <div class="space-y-1 text-xs text-gray-600">
              <p><span class="font-medium">Admin:</span> admin&#64;vuelosapp.com / admin123</p>
              <p><span class="font-medium">Cliente:</span> cliente&#64;gmail.com / cliente123</p>
            </div>
          </div>

          <p class="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta? <a routerLink="/register" class="text-blue-600 font-medium hover:underline">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private svc    = inject(AuthService);
  private auth   = inject(AuthStore);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  loading  = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    this.svc.login(this.form.value as any).subscribe({
      next: () => this.router.navigate([this.auth.isAdmin() ? '/admin/dashboard' : '/']),
      error: (err) => {
        this.errorMsg.set(err?.error?.error?.message ?? 'Error al iniciar sesión');
        this.loading.set(false);
      },
    });
  }
}
