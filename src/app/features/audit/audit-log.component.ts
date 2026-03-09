import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { AuditService } from '../../core/services/audit.service';
import { AuditEntry } from '../../core/models/audit.model';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [RelativeTimePipe],
  template: `
    <div class="p-6 max-w-7xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-100">Audit Log</h1>
          <p class="text-slate-400 text-sm mt-1">Complete history of all system actions</p>
        </div>
        <button
          (click)="exportLog()"
          class="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors text-sm"
          aria-label="Export audit log as CSV"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Export CSV
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input
            type="text"
            placeholder="Search by user or action..."
            (input)="onSearch($event)"
            class="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-400"
            aria-label="Search audit log"
          />
        </div>
        <select
          (change)="onTypeFilter($event)"
          class="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-sm focus:outline-none focus:border-teal-400"
          aria-label="Filter by action type"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="SETTINGS_CHANGE">Settings Change</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-white">{{ entries().length }}</div>
          <div class="text-slate-400 text-xs mt-1">Total Events</div>
        </div>
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-teal-400">{{ todayCount() }}</div>
          <div class="text-slate-400 text-xs mt-1">Today</div>
        </div>
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-emerald-400">{{ loginCount() }}</div>
          <div class="text-slate-400 text-xs mt-1">Logins</div>
        </div>
        <div class="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
          <div class="text-2xl font-bold text-amber-400">{{ changeCount() }}</div>
          <div class="text-slate-400 text-xs mt-1">Changes</div>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <div class="animate-spin w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full"></div>
        </div>
      }

      <!-- Table -->
      @if (!loading()) {
        <div class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm" role="table" aria-label="Audit log entries">
              <thead>
                <tr class="border-b border-slate-700 bg-slate-900/50">
                  <th class="text-left px-4 py-3 text-slate-400 font-medium" scope="col">Time</th>
                  <th class="text-left px-4 py-3 text-slate-400 font-medium" scope="col">User</th>
                  <th class="text-left px-4 py-3 text-slate-400 font-medium" scope="col">Action</th>
                  <th class="text-left px-4 py-3 text-slate-400 font-medium" scope="col">Details</th>
                  <th class="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell" scope="col">IP</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                @for (entry of filtered(); track entry.id) {
                  <tr class="hover:bg-slate-700/30 transition-colors">
                    <td class="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {{ entry.timestamp | relativeTime }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/50 flex items-center justify-center text-teal-400 text-xs font-semibold flex-shrink-0">
                          {{ getInitials(entry.userName) }}
                        </div>
                        <span class="text-slate-200 text-xs">{{ entry.userName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border" [class]="getBadgeClass(entry.action)">
                        {{ entry.action }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-slate-300 text-xs max-w-xs truncate">{{ entry.details }}</td>
                    <td class="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{{ entry.ipAddress }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="5" class="px-4 py-12 text-center text-slate-400">No entries match your filters</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="px-4 py-3 border-t border-slate-700 text-slate-400 text-xs">
            Showing {{ filtered().length }} of {{ entries().length }} entries
          </div>
        </div>
      }
    </div>
  `,
})
export class AuditLogComponent implements OnInit {
  private auditService = inject(AuditService);

  entries = signal<AuditEntry[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  typeFilter = signal('');

  filtered = computed(() => {
    let result = this.entries();
    const q = this.searchQuery().toLowerCase();
    const t = this.typeFilter();
    if (q) result = result.filter(e => e.userName.toLowerCase().includes(q) || e.details.toLowerCase().includes(q));
    if (t) result = result.filter(e => e.action === t);
    return result;
  });

  todayCount = computed(() => this.entries().filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length);
  loginCount = computed(() => this.entries().filter(e => e.action === 'LOGIN').length);
  changeCount = computed(() => this.entries().filter(e => ['UPDATE', 'DELETE', 'SETTINGS_CHANGE'].includes(e.action)).length);

  async ngOnInit() {
    const { data } = await this.auditService.getAuditLogs(1, 200);
    this.entries.set(data);
    this.loading.set(false);
  }

  onSearch(e: Event) { this.searchQuery.set((e.target as HTMLInputElement).value); }
  onTypeFilter(e: Event) { this.typeFilter.set((e.target as HTMLSelectElement).value); }
  getInitials(name: string) { return initials(name); }

  getBadgeClass(action: string): string {
    const map: Record<string, string> = {
      LOGIN: 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50',
      LOGOUT: 'bg-slate-700 text-slate-400 border-slate-600',
      CREATE: 'bg-blue-900/50 text-teal-400 border-teal-700/50',
      UPDATE: 'bg-amber-900/50 text-amber-400 border-amber-700/50',
      DELETE: 'bg-red-900/50 text-red-400 border-red-700/50',
      SETTINGS_CHANGE: 'bg-purple-900/50 text-purple-400 border-purple-700/50',
    };
    return map[action] || 'bg-slate-700 text-slate-400 border-slate-600';
  }

  exportLog() {
    const rows = [['Time', 'User', 'Action', 'Details', 'IP']];
    this.filtered().forEach(e => rows.push([e.timestamp, e.userName, e.action, e.details, e.ipAddress]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
