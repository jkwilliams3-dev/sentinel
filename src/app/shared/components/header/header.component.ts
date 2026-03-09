import { Component, inject, Output, EventEmitter, signal, computed, HostListener, ElementRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

interface AppNotification {
  id: number;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  route: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, StatusBadgeComponent],
  template: `
    <header
      class="h-16 bg-slate-900 border-b border-slate-700 flex items-center px-4 lg:px-6 gap-4"
      role="toolbar"
      aria-label="Application header"
    >
      <!-- Hamburger menu (mobile) -->
      <button
        (click)="menuToggle.emit()"
        class="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <!-- Page title -->
      <div class="flex-1">
        <h1 class="text-slate-200 font-semibold text-base">{{ pageTitle }}</h1>
      </div>

      <!-- Right side actions -->
      <div class="flex items-center gap-3 relative" role="toolbar" aria-label="User actions">

        <!-- Notification bell -->
        <div class="relative" #notifContainer>
          <button
            (click)="toggleNotif()"
            class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
            [attr.aria-label]="unreadCount() + ' unread notifications'"
            aria-haspopup="true"
            [attr.aria-expanded]="notifOpen()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            @if (unreadCount() > 0) {
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-400 rounded-full" aria-hidden="true"></span>
            }
          </button>

          <!-- Notification dropdown -->
          @if (notifOpen()) {
            <div
              class="absolute right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50"
              style="width: 320px; top: 100%;"
              role="menu"
            >
              <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <span class="text-slate-200 font-semibold text-sm">Notifications</span>
                @if (unreadCount() > 0) {
                  <button
                    (click)="markAllRead()"
                    class="text-xs text-teal-400 hover:underline cursor-pointer"
                    type="button"
                  >Mark all read</button>
                }
              </div>
              @for (n of notifications(); track n.id) {
                <button
                  (click)="handleNotif(n)"
                  class="w-full px-4 py-3 border-b border-slate-800 hover:bg-slate-800 transition-colors text-left last:border-0"
                  [class.bg-slate-800]="n.unread"
                  role="menuitem"
                  type="button"
                >
                  <div class="flex items-start gap-3">
                    <span
                      class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      [class.bg-teal-400]="n.unread"
                    ></span>
                    <div>
                      <p class="text-sm font-medium" [class.text-slate-100]="n.unread" [class.text-slate-400]="!n.unread">{{ n.title }}</p>
                      <p class="text-slate-400 text-xs mt-0.5">{{ n.body }}</p>
                      <p class="text-slate-600 text-xs mt-1">{{ n.time }}</p>
                    </div>
                  </div>
                </button>
              }
            </div>
          }
        </div>

        <!-- User menu -->
        @if (currentUser()) {
          <div class="relative flex items-center gap-2" #userContainer>
            <app-status-badge [status]="currentUser()!.role"></app-status-badge>
            <button
              (click)="toggleUser()"
              class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="User menu"
              aria-haspopup="true"
              [attr.aria-expanded]="userOpen()"
              type="button"
            >
              <div class="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {{ currentUser()!.avatar }}
              </div>
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            @if (userOpen()) {
              <div
                class="absolute right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                style="width: 200px; top: 100%;"
                role="menu"
              >
                <div class="px-4 py-3 border-b border-slate-800">
                  <p class="text-slate-200 text-sm font-semibold">{{ currentUser()!.name }}</p>
                  <p class="text-slate-400 text-xs">{{ currentUser()!.email }}</p>
                </div>
                <button (click)="goTo('/settings')" class="w-full flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-800 transition-colors text-sm text-left" role="menuitem" type="button">
                  <span>👤</span>Profile Settings
                </button>
                <button (click)="goTo('/settings')" class="w-full flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-800 transition-colors text-sm text-left" role="menuitem" type="button">
                  <span>⚙️</span>Preferences
                </button>
                <button (click)="goTo('/audit')" class="w-full flex items-center gap-2 px-4 py-2.5 text-slate-300 hover:bg-slate-800 transition-colors text-sm text-left" role="menuitem" type="button">
                  <span>📋</span>Audit Log
                </button>
                <div class="border-t border-slate-800">
                  <button (click)="logout()" class="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-slate-800 transition-colors text-sm text-left" role="menuitem" type="button">
                    <span>🚪</span>Sign Out
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();

  authService = inject(AuthService);
  router = inject(Router);
  el = inject(ElementRef);

  currentUser = this.authService.currentUser;
  notifOpen = signal(false);
  userOpen = signal(false);

  notifications = signal<AppNotification[]>([
    { id: 1, title: 'New user registered', body: 'manager@company.com joined the org', time: '3m ago', unread: true, route: '/users' },
    { id: 2, title: 'Permission change', body: 'Role updated for 2 users', time: '1h ago', unread: true, route: '/audit' },
    { id: 3, title: 'Settings updated', body: 'MFA policy was enabled org-wide', time: '3h ago', unread: false, route: '/settings' },
    { id: 4, title: 'Audit log exported', body: 'CSV export completed successfully', time: '6h ago', unread: false, route: '/audit' },
  ]);

  unreadCount = computed(() => this.notifications().filter((n: AppNotification) => n.unread).length);

  get pageTitle(): string { return 'Sentinel'; }

  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) {
      this.notifOpen.set(false);
      this.userOpen.set(false);
    }
  }

  toggleNotif() { this.notifOpen.update(v => !v); this.userOpen.set(false); }
  toggleUser() { this.userOpen.update(v => !v); this.notifOpen.set(false); }

  handleNotif(n: AppNotification) {
    this.notifications.update(list => list.map(x => x.id === n.id ? { ...x, unread: false } : x));
    this.notifOpen.set(false);
    this.router.navigate([n.route]);
  }

  markAllRead() {
    this.notifications.update(list => list.map(x => ({ ...x, unread: false })));
  }

  goTo(route: string) {
    this.userOpen.set(false);
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
