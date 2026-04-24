import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-form-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      (click)="handleOverlayClick($event)">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
          <button type="button" (click)="onClose.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form (submit)="handleSubmit($event)" class="flex flex-col flex-1 overflow-hidden">
          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <ng-content></ng-content>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button type="button" (click)="onClose.emit()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" [disabled]="isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ isLoading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AdminFormModalComponent {
  @Input() title = '';
  @Input() open = false;
  @Input() isLoading = false;
  @Output() onClose  = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<Event>();

  @HostListener('document:keydown.escape')
  onEscape() { if (this.open) this.onClose.emit(); }

  handleSubmit(e: Event) {
    e.preventDefault();
    this.onSubmit.emit(e);
  }

  handleOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('fixed')) this.onClose.emit();
  }
}
