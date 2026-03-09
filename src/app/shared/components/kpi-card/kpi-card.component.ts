import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  template: `
    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <p class="text-slate-400 text-sm font-medium">{{ title }}</p>
        <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center ' + colorClass">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="icon"/>
          </svg>
        </div>
      </div>

      @if (loading) {
        <div class="animate-pulse">
          <div class="h-8 bg-slate-700 rounded w-24 mb-2"></div>
          <div class="h-4 bg-slate-700 rounded w-16"></div>
        </div>
      } @else {
        <div>
          <p class="text-3xl font-bold text-slate-100">{{ value }}</p>
          <div class="flex items-center gap-1 mt-1">
            @if (trendPositive !== null) {
              <span [class]="trendPositive ? 'text-emerald-400' : 'text-red-400'" class="text-sm font-medium flex items-center gap-0.5">
                @if (trendPositive) {
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  </svg>
                } @else {
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                }
                {{ trend }}
              </span>
            }
            <span class="text-slate-400 text-xs">{{ trendLabel }}</span>
          </div>
        </div>
      }
    </div>
  `,
})
export class KpiCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() trend = '';
  @Input() trendLabel = '';
  @Input() icon = '';
  @Input() colorClass = 'bg-blue-500/20 text-blue-400';
  @Input() loading = false;
  @Input() trendPositive: boolean | null = null;
}
