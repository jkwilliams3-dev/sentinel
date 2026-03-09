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
          icon="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          colorClass="bg-teal-400/20 text-teal-400"
          [trendPositive]="true"
        ></app-kpi-card>
        <app-kpi-card
          title="Revenue"
          value="$89.4K"
          trend="+8.3%"
          trendLabel="from last month"
          icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          colorClass="bg-emerald-500/20 text-emerald-400"
          [trendPositive]="true"
        ></app-kpi-card>
        <app-kpi-card
          title="Active Projects"
          value="142"
          trend="-3"
          trendLabel="from last week"
          icon="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
          colorClass="bg-amber-500/20 text-amber-400"
          [trendPositive]="false"
        ></app-kpi-card>
        <app-kpi-card
          title="System Health"
          value="99.7%"
          trend=""
          trendLabel="Optimal"
          icon="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          colorClass="bg-emerald-500/20 text-emerald-400"
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
                  <p class="text-slate-400 text-xs mt-0.5">{{ entry.timestamp | relativeTime }}</p>
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
