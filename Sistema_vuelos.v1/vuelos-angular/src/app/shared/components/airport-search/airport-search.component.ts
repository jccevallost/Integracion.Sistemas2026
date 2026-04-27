import { Component, Input, Output, EventEmitter, inject, signal, computed, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AirportsService } from '../../../core/services/airports.service';

export interface AirportOption {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  searchText: string;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function airportScore(a: AirportOption, query: string): number {
  if (!query) return 1;

  const code = normalizeText(a.iataCode);
  const city = normalizeText(a.cityName);
  const name = normalizeText(a.name);
  const country = normalizeText(a.countryName);

  if (code === query) return 100;
  if (city === query) return 95;
  if (name === query) return 90;
  if (code.startsWith(query)) return 85;
  if (city.startsWith(query)) return 80;
  if (name.startsWith(query)) return 70;
  if (country.startsWith(query)) return 60;
  if (a.searchText.includes(query)) return 40;
  return 0;
}

@Component({
  selector: 'app-airport-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="relative">
        <ng-content select="[icon]"></ng-content>
        <input #inputEl [(ngModel)]="query" (input)="onInput()" (focus)="open.set(true)" (keydown)="onKey($event)"
          [placeholder]="placeholder" autocomplete="off"
          class="w-full border-2 rounded-xl pl-9 pr-8 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 outline-none transition-colors placeholder:font-normal placeholder:text-gray-400"
          [class.border-gray-200]="!selected()" [class.border-blue-400]="!!selected()" />
        <button *ngIf="selected()" type="button" (click)="clear()"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 text-xs transition-colors">x</button>
      </div>

      <div *ngIf="open() && filtered().length > 0"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
        <button *ngFor="let a of filtered(); let i = index" type="button" (click)="select(a)"
          class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
          [class.bg-blue-50]="i === cursor()">
          <span class="w-10 flex-shrink-0 font-mono font-bold text-blue-600 text-sm">{{ a.iataCode }}</span>
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ a.cityName }} <span class="text-gray-400 font-normal">{{ a.countryName }}</span>
            </p>
            <p class="text-xs text-gray-400 truncate">{{ a.name }}</p>
          </div>
        </button>
      </div>

      <div *ngIf="open() && query.length >= 2 && filtered().length === 0 && !loading()"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400">
        Sin resultados para "{{ query }}"
      </div>

      <div *ngIf="open() && loading()"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400">
        Cargando aeropuertos...
      </div>
    </div>
  `,
})
export class AirportSearchComponent implements OnInit {
  @Input() placeholder = 'Ciudad o codigo IATA';
  @Input() set value(v: string) {
    const next = (v ?? '').trim().toUpperCase();
    if (!next) {
      this._code = '';
      this.query = '';
      return;
    }
    if (next !== this._code) {
      this._code = next;
      this.syncLabel();
    }
  }
  @Output() valueChange = new EventEmitter<string>();

  private svc = inject(AirportsService);
  private elRef = inject(ElementRef);

  airports = signal<AirportOption[]>([]);
  loading = signal(true);
  open = signal(false);
  cursor = signal(-1);
  query = '';
  private _code = '';

  filtered = computed(() => {
    const q = normalizeText(this.query);
    if (q.length < 1) return this.airports().slice(0, 8);

    return this.airports()
      .map(a => ({ item: a, score: airportScore(a, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.item.cityName.localeCompare(b.item.cityName))
      .map(({ item }) => item)
      .slice(0, 10);
  });

  selected = computed(() => !!this._code);

  ngOnInit() {
    this.svc.getAll().subscribe({
      next: data => {
        this.airports.set(data.map(a => ({
          iataCode: a.iataCode.toUpperCase(),
          name: a.name,
          cityName: a.city?.name ?? a.name,
          countryName: a.city?.country?.name ?? '',
          searchText: normalizeText(`${a.iataCode} ${a.name} ${a.city?.name ?? ''} ${a.city?.country?.name ?? ''}`),
        })));
        this.loading.set(false);
        this.syncLabel();
      },
      error: () => {
        this.airports.set([]);
        this.loading.set(false);
      },
    });
  }

  private syncLabel() {
    const found = this.airports().find(a => a.iataCode === this._code);
    if (found) this.query = `${found.iataCode} - ${found.cityName}`;
  }

  onInput() {
    this._code = '';
    this.cursor.set(-1);
    this.open.set(true);
    this.valueChange.emit('');
  }

  onKey(e: KeyboardEvent) {
    const len = this.filtered().length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.cursor.update(c => Math.min(c + 1, len - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.cursor.update(c => Math.max(c - 1, -1));
    } else if (e.key === 'Enter' && this.cursor() >= 0) {
      e.preventDefault();
      this.select(this.filtered()[this.cursor()]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.resolveCurrentValue();
    } else if (e.key === 'Escape') {
      this.open.set(false);
    }
  }

  select(a: AirportOption) {
    this._code = a.iataCode;
    this.query = `${a.iataCode} - ${a.cityName}`;
    this.open.set(false);
    this.cursor.set(-1);
    this.valueChange.emit(a.iataCode);
  }

  resolveCurrentValue(): string {
    if (this._code) return this._code;
    if (!normalizeText(this.query)) return '';
    const match = this.filtered()[0];
    if (!match) return '';
    this.select(match);
    return match.iataCode;
  }

  clear() {
    this._code = '';
    this.query = '';
    this.open.set(false);
    this.valueChange.emit('');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.elRef.nativeElement.contains(e.target)) this.open.set(false);
  }
}
