import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuditService } from '../../core/services/audit.service';
import { AuditEntry } from '../../core/models/audit.model';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, KpiCardComponent, StatusBadgeComponent, RelativeTimePipe],
  template: `
    <div class="p-6 space-y-6 max-w-7xl mx-auto">
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-blue-900/40 to-slate-800 border border-blue-700/30 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-100">
            Welcome back, {{ currentUser()?.name ?? 'User' }}!
          </h2>
          <p class="text-slate-400 mt-1 text-sm">Here's what's happening in your organization today.</p>
        </div>
        <div class="hidden sm:block">
          <app-status-badge [status]="currentUser()?.role ?? null"></app-status-badge>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <app-kpi-card
          title="Total Users"
          value="2,847"
          trend="+12%"
          trendLabel="from last month"
          icon="👥"
          colorClass="bg-teal-400/20"
          [trendPositive]="true"
        ></app-kpi-card>
        <app-kpi-card
          title="Revenue"
          value="$89.4K"
          trend="+8.3%"
          trendLabel="from last month"
          icon="💰"
          colorClass="bg-emerald-500/20"
          [trendPositive]="true"
        ></app-kpi-card>
        <app-kpi-card
          title="Active Projects"
          value="142"
          trend="-3"
          trendLabel="from last week"
          icon="📁"
          colorClass="bg-amber-500/20"
          [trendPositive]="false"
        ></app-kpi-card>
        <app-kpi-card
          title="System Health"
          value="99.7%"
          trend=""
          trendLabel="Optimal"
          icon="🟢"
          colorClass="bg-emerald-500/20"
          [trendPositive]="null"
        ></app-kpi-card>
      </div>

      <!-- Bottom grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Activity Feed -->
        <div class="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h3 class="text-slate-100 font-semibold">Recent Activity</h3>
            <a routerLink="/audit" class="text-teal-400 hover:text-blue-300 text-sm transition-colors">View all</a>
          </div>
          <div class="divide-y divide-slate-700/50">
            @for (entry of recentActivity(); track entry.id) {
              <div class="flex items-start gap-3 px-6 py-3">
                <div class="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                  {{ entry.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-slate-300 text-sm">
                    <span class="font-medium text-slate-100">{{ entry.userName }}</span>
                    <span class="text-slate-400"> — {{ entry.details }}</span>
                  </p>
                  <p class="text-slate-500 text-xs mt-0.5">{{ entry.timestamp | relativeTime }}</p>
                </div>
                <span [class]="actionBadgeClass(entry.action)" class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  {{ entry.action }}
                </span>
              </div>
            }
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-slate-800 border border-slate-700 rounded-xl">
          <div class="px-6 py-4 border-b border-slate-700">
            <h3 class="text-slate-100 font-semibold">Quick Actions</h3>
          </div>
          <div class="p-4 space-y-2">
            <a
              routerLink="/users"
              class="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-blue-600/20 text-teal-400 hover:text-blue-300 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              <span class="text-sm font-medium">Create User</span>
            </a>
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/20 text-emerald-400 hover:text-emerald-300 transition-colors"
              aria-label="Export report as CSV"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="text-sm font-medium">Export Report</span>
            </button>
            <a
              routerLink="/audit"
              class="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/20 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span class="text-sm font-medium">View Audit Log</span>
            </a>
            <a
              routerLink="/settings"
              class="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-sm font-medium">Settings</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private auditService = inject(AuditService);

  currentUser = this.authService.currentUser;
  recentActivity = signal<AuditEntry[]>([]);

  ngOnInit(): void {
    this.recentActivity.set(this.auditService.getRecentEntries(10));
  }

  actionBadgeClass(action: string): string {
    switch (action) {
      case 'LOGIN': case 'LOGOUT': return 'bg-blue-900/50 text-teal-400 border border-teal-700/50';
      case 'CREATE': return 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50';
      case 'UPDATE': return 'bg-amber-900/50 text-amber-400 border border-amber-700/50';
      case 'DELETE': return 'bg-red-900/50 text-red-400 border border-red-700/50';
      case 'EXPORT': return 'bg-purple-900/50 text-purple-400 border border-purple-700/50';
      case 'SETTINGS_CHANGE': return 'bg-orange-900/50 text-orange-400 border border-orange-700/50';
      default: return 'bg-slate-700 text-slate-400';
    }
  }
}
