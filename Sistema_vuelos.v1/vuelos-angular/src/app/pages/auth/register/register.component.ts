import { Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-10">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p class="text-sm text-gray-500 mt-1">Únete a VuelosApp</p>
          </div>

          <div *ngIf="errorMsg()" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {{ errorMsg() }}
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                <input formControlName="firstName" placeholder="Juan"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <p *ngIf="form.get('firstName')?.touched && form.get('firstName')?.invalid" class="text-xs text-red-500 mt-1">Requerido</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Primer Apellido *</label>
                <input formControlName="firstLastName" placeholder="Pérez"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                <p *ngIf="form.get('firstLastName')?.touched && form.get('firstLastName')?.invalid" class="text-xs text-red-500 mt-1">Requerido</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Segundo Nombre</label>
                <input formControlName="secondName" placeholder="Carlos"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Segundo Apellido</label>
                <input formControlName="secondLastName" placeholder="García"
                  class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input formControlName="email" type="email" placeholder="tu@email.com"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <p *ngIf="form.get('email')?.touched && form.get('email')?.invalid" class="text-xs text-red-500 mt-1">Email inválido</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
              <input formControlName="mainAddress" placeholder="Av. Principal 123"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
              <input formControlName="phone" placeholder="+593..."
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Contraseña *</label>
              <input formControlName="password" type="password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <p *ngIf="form.get('password')?.touched && form.get('password')?.invalid" class="text-xs text-red-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña *</label>
              <input formControlName="confirmPassword" type="password" placeholder="••••••••"
                class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <p *ngIf="form.get('confirmPassword')?.touched && form.errors?.['passwordMismatch']" class="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors mt-2">
              <svg *ngIf="loading()" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              {{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta? <a routerLink="/login" class="text-blue-600 font-medium hover:underline">Inicia sesión</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private svc    = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  loading  = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.group({
    firstName:       ['', Validators.required],
    firstLastName:   ['', Validators.required],
    secondName:      [''],
    secondLastName:  [''],
    email:           ['', [Validators.required, Validators.email]],
    mainAddress:     [''],
    phone:           [''],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, {
    validators: (g) => {
      const pw = g.get('password')?.value;
      const cp = g.get('confirmPassword')?.value;
      return pw && cp && pw !== cp ? { passwordMismatch: true } : null;
    },
  });

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set(null);
    const { confirmPassword, ...data } = this.form.value as any;
    this.svc.register(data).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.errorMsg.set(err?.error?.error?.message ?? 'Error al registrarse');
        this.loading.set(false);
      },
    });
  }
}
