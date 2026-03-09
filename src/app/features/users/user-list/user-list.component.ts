import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService, UserFilters } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, UserRole } from '../../../core/models/user.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent, RelativeTimePipe],
  template: `
    <div class="space-y-4 p-6">
      <!-- Toolbar -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-2 flex-1">
          <!-- Search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="search"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search users..."
              class="pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 w-full sm:w-64 text-sm"
              aria-label="Search users"
            />
          </div>

          <!-- Role filter -->
          <select
            [(ngModel)]="roleFilter"
            (ngModelChange)="onFilterChange()"
            class="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            aria-label="Filter by role"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Viewer">Viewer</option>
          </select>

          <!-- Status filter -->
          <select
            [(ngModel)]="statusFilter"
            (ngModelChange)="onFilterChange()"
            class="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <!-- Export -->
          <button
            (click)="exportCsv()"
            class="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
            aria-label="Export users to CSV"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export CSV
          </button>

          <!-- Create -->
          @if (canEdit()) {
            <button
              (click)="createUser.emit()"
              class="flex items-center gap-2 px-3 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg text-sm font-medium transition-colors"
              aria-label="Create new user"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Create User
            </button>
          }
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      @if (selectedIds().length > 0) {
        <div class="flex items-center gap-3 px-4 py-3 bg-teal-900/30 border border-teal-700/50 rounded-lg" role="alert" aria-live="polite">
          <span class="text-blue-300 text-sm font-medium">{{ selectedIds().length }} selected</span>
          <div class="flex items-center gap-2 ml-auto">
            <select
              [(ngModel)]="bulkRole"
              class="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
              aria-label="Select role for bulk update"
            >
              <option value="">Change Role...</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
            <button
              (click)="onBulkRole()"
              [disabled]="!bulkRole"
              class="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white text-sm rounded transition-colors"
              aria-label="Apply role change to selected users"
            >Apply Role</button>
            <button
              (click)="onBulkDeactivate()"
              class="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white text-sm rounded transition-colors"
              aria-label="Deactivate selected users"
            >Deactivate</button>
            <button
              (click)="clearSelection()"
              class="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              aria-label="Clear selection"
            >Clear</button>
          </div>
        </div>
      }

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-slate-700">
        <table class="w-full text-sm" role="grid" aria-label="Users table">
          <caption class="sr-only">User management table with sorting and filtering</caption>
          <thead class="bg-slate-800/80">
            <tr>
              <th scope="col" class="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  [checked]="allSelected()"
                  (change)="toggleAll($event)"
                  class="w-4 h-4 bg-slate-900 border-slate-600 rounded text-blue-600 focus:ring-teal-400"
                  aria-label="Select all users"
                />
              </th>
              @for (col of columns; track col.key) {
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  [class.cursor-pointer]="col.sortable"
                  [class.hover:text-slate-200]="col.sortable"
                  (click)="col.sortable && sort(col.key)"
                >
                  <div class="flex items-center gap-1">
                    {{ col.label }}
                    @if (col.sortable) {
                      <span class="text-slate-600">
                        @if (sortColumn() === col.key) {
                          @if (sortDir() === 'asc') { ↑ } @else { ↓ }
                        } @else {
                          ↕
                        }
                      </span>
                    }
                  </div>
                </th>
              }
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            @if (loading()) {
              @for (i of skeletonRows; track i) {
                <tr class="bg-slate-900/30">
                  <td class="px-4 py-3"><div class="w-4 h-4 bg-slate-700 rounded animate-pulse"></div></td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
                      <div class="space-y-1">
                        <div class="h-3 bg-slate-700 rounded w-24 animate-pulse"></div>
                        <div class="h-2 bg-slate-700 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3"><div class="h-3 bg-slate-700 rounded w-16 animate-pulse"></div></td>
                  <td class="px-4 py-3"><div class="h-5 bg-slate-700 rounded-full w-14 animate-pulse"></div></td>
                  <td class="px-4 py-3"><div class="h-3 bg-slate-700 rounded w-20 animate-pulse"></div></td>
                  <td class="px-4 py-3"><div class="h-3 bg-slate-700 rounded w-24 animate-pulse"></div></td>
                  <td class="px-4 py-3"><div class="h-3 bg-slate-700 rounded w-16 animate-pulse"></div></td>
                </tr>
              }
            } @else if (users().length === 0) {
              <tr>
                <td colspan="7" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center gap-3 text-slate-500">
                    <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <p class="text-sm">No users found matching your criteria.</p>
                    <button (click)="clearFilters()" class="text-teal-400 hover:text-blue-300 text-sm underline">Clear filters</button>
                  </div>
                </td>
              </tr>
            } @else {
              @for (user of users(); track user.id) {
                <tr
                  class="bg-slate-900/20 hover:bg-slate-800/50 transition-colors"
                  [class.bg-blue-900/10]="isSelected(user.id)"
                >
                  <td class="px-4 py-3">
                    <input
                      type="checkbox"
                      [checked]="isSelected(user.id)"
                      (change)="toggleSelect(user.id)"
                      class="w-4 h-4 bg-slate-900 border-slate-600 rounded text-blue-600 focus:ring-teal-400"
                      [attr.aria-label]="'Select user ' + user.name"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {{ user.avatar }}
                      </div>
                      <div>
                        <p class="text-slate-200 font-medium">{{ user.name }}</p>
                        <p class="text-slate-500 text-xs">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-slate-400">{{ user.department }}</td>
                  <td class="px-4 py-3">
                    <app-status-badge [status]="user.role"></app-status-badge>
                  </td>
                  <td class="px-4 py-3">
                    <app-status-badge [status]="user.status"></app-status-badge>
                  </td>
                  <td class="px-4 py-3 text-slate-400 text-xs">{{ user.lastLogin | relativeTime }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      @if (canEdit()) {
                        <button
                          (click)="editUser.emit(user)"
                          class="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-teal-900/30 rounded transition-colors"
                          [attr.aria-label]="'Edit user ' + user.name"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                      }
                      @if (canEdit()) {
                        <button
                          (click)="onToggleStatus(user)"
                          [class]="user.status === 'Active' ? 'text-emerald-400 hover:bg-emerald-900/30' : 'text-slate-400 hover:bg-slate-700'"
                          class="p-1.5 rounded transition-colors"
                          [attr.aria-label]="(user.status === 'Active' ? 'Deactivate' : 'Activate') + ' user ' + user.name"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </button>
                      }
                      @if (canDelete()) {
                        <button
                          (click)="onDelete(user)"
                          class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
                          [attr.aria-label]="'Delete user ' + user.name"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between px-1">
        <p class="text-sm text-slate-500">
          Showing {{ rangeStart }}&ndash;{{ rangeEnd }} of {{ total() }} users
        </p>
        <div class="flex items-center gap-2">
          <button
            (click)="prevPage()"
            [disabled]="currentPage() === 1"
            class="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to previous page"
          >Previous</button>
          <span class="text-sm text-slate-400">Page {{ currentPage() }} of {{ totalPages() }}</span>
          <button
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages()"
            class="px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to next page"
          >Next</button>
        </div>
      </div>
    </div>
  `,
})
export class UserListComponent implements OnInit {
  @Output() createUser = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<User>();

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  total = signal(0);
  loading = signal(false);
  currentPage = signal(1);
  pageSize = 10;
  selectedIds = signal<string[]>([]);
  sortColumn = signal('name');
  sortDir = signal<'asc' | 'desc'>('asc');

  searchQuery = '';
  roleFilter = 'All';
  statusFilter = 'All';
  bulkRole = '';

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'lastLogin', label: 'Last Login', sortable: true },
  ];

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));
  allSelected = computed(() => this.users().length > 0 && this.selectedIds().length === this.users().length);

  get rangeStart(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage() * this.pageSize, this.total());
  }

  canEdit(): boolean {
    return this.authService.hasRole(['Admin', 'Manager']);
  }

  canDelete(): boolean {
    return this.authService.hasRole('Admin');
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const filters: UserFilters = {
        search: this.searchQuery,
        role: this.roleFilter,
        status: this.statusFilter,
        sortColumn: this.sortColumn(),
        sortDirection: this.sortDir(),
      };
      const result = await this.userService.getUsers(this.currentPage(), this.pageSize, filters);
      this.users.set(result.data);
      this.total.set(result.total);
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.currentPage.set(1);
      this.loadUsers();
    }, 300);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  sort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDir.set('asc');
    }
    this.loadUsers();
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadUsers();
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelect(id: string): void {
    this.selectedIds.update((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
    );
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(checked ? this.users().map((u) => u.id) : []);
  }

  clearSelection(): void {
    this.selectedIds.set([]);
    this.bulkRole = '';
  }

  async onBulkRole(): Promise<void> {
    if (!this.bulkRole) return;
    await this.userService.bulkUpdateRole(this.selectedIds(), this.bulkRole as UserRole);
    this.toastService.success(`Role updated to ${this.bulkRole} for ${this.selectedIds().length} users.`);
    this.clearSelection();
    this.loadUsers();
  }

  async onBulkDeactivate(): Promise<void> {
    await this.userService.bulkDeactivate(this.selectedIds());
    this.toastService.success(`${this.selectedIds().length} users deactivated.`);
    this.clearSelection();
    this.loadUsers();
  }

  async onToggleStatus(user: User): Promise<void> {
    await this.userService.toggleStatus(user.id);
    this.toastService.success(`${user.name} is now ${user.status === 'Active' ? 'Inactive' : 'Active'}.`);
    this.loadUsers();
  }

  async onDelete(user: User): Promise<void> {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    await this.userService.deleteUser(user.id);
    this.toastService.success(`${user.name} deleted successfully.`);
    this.loadUsers();
  }

  exportCsv(): void {
    this.userService.exportToCsv(this.users());
    this.toastService.success('Users exported to CSV.');
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.roleFilter = 'All';
    this.statusFilter = 'All';
    this.currentPage.set(1);
    this.loadUsers();
  }
}
