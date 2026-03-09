import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', route: '/dashboard' },
  { label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', route: '/users' },
  { label: 'Audit Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', route: '/audit' },
  { label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', route: '/settings', adminOnly: true },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile overlay -->
    @if (isOpen()) {
      <div
        class="fixed inset-0 bg-black/50 z-20 lg:hidden"
        (click)="toggle()"
        aria-hidden="true"
      ></div>
    }

    <!-- Sidebar -->
    <aside
      [class]="isOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700 flex flex-col z-30 transition-transform duration-300 ease-in-out lg:relative lg:flex lg:translate-x-0"
      aria-label="Main navigation"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div class="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
        </div>
        <div>
          <p class="text-slate-100 font-bold text-sm">Sentinel</p>
          <p class="text-slate-500 text-xs">Management Platform</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto" aria-label="Sidebar navigation">
        <ul class="space-y-1" role="list">
          @for (item of navItems; track item.route) {
            @if (!item.adminOnly || isAdmin()) {
              <li>
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-teal-500/20 text-teal-400 border-teal-400/50"
                  [routerLinkActiveOptions]="{ exact: false }"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-transparent group"
                  (click)="closeMobile()"
                >
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" [attr.d]="item.icon"/>
                  </svg>
                  <span class="text-sm font-medium">{{ item.label }}</span>
                </a>
              </li>
            }
          }
        </ul>
      </nav>

      <!-- User section -->
      <div class="px-3 py-4 border-t border-slate-700">
        @if (currentUser()) {
          <div class="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-slate-800/50">
            <div class="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {{ currentUser()!.avatar }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-slate-200 text-sm font-medium truncate">{{ currentUser()!.name }}</p>
              <p class="text-slate-500 text-xs truncate">{{ currentUser()!.role }}</p>
            </div>
          </div>
        }
        <button
          (click)="logout()"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          aria-label="Logout from Sentinel"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span class="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Output() toggled = new EventEmitter<boolean>();

  authService = inject(AuthService);
  isOpen = signal(false);

  navItems = NAV_ITEMS;

  currentUser = this.authService.currentUser;

  isAdmin(): boolean {
    return this.authService.hasRole('Admin');
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
    this.toggled.emit(this.isOpen());
  }

  closeMobile(): void {
    this.isOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
