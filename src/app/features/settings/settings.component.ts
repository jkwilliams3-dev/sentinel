import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-slate-100">Settings</h1>
        <p class="text-slate-400 text-sm mt-1">Manage your organization configuration</p>
      </div>

      <!-- Save banner -->
      @if (saved()) {
        <div class="flex items-center gap-2 px-4 py-3 bg-emerald-900/50 border border-emerald-700/50 rounded-lg text-emerald-300 text-sm" role="alert" aria-live="polite">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          Settings saved successfully
        </div>
      }

      <!-- Org Settings -->
      <section class="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5" aria-labelledby="org-heading">
        <h2 id="org-heading" class="text-base font-semibold text-slate-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          Organization
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5" for="org-name">Organization Name</label>
            <input id="org-name" type="text" [(ngModel)]="orgName" class="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5" for="org-timezone">Timezone</label>
            <select id="org-timezone" [(ngModel)]="timezone" class="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500">
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5" for="org-email">Support Email</label>
            <input id="org-email" type="email" [(ngModel)]="supportEmail" class="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-slate-300 text-sm font-medium mb-1.5" for="org-domain">Domain</label>
            <input id="org-domain" type="text" [(ngModel)]="domain" class="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500" placeholder="app.yourcompany.com" />
          </div>
        </div>
      </section>

      <!-- Security Settings -->
      <section class="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5" aria-labelledby="security-heading">
        <h2 id="security-heading" class="text-base font-semibold text-slate-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          Security
        </h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-slate-700/50">
            <div>
              <p class="text-slate-200 text-sm font-medium">Multi-Factor Authentication</p>
              <p class="text-slate-500 text-xs mt-0.5">Require MFA for all admin accounts</p>
            </div>
            <button
              role="switch" [attr.aria-checked]="mfaEnabled()" (click)="mfaEnabled.set(!mfaEnabled())"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              [class]="mfaEnabled() ? 'bg-blue-600' : 'bg-slate-600'"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" [class]="mfaEnabled() ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-slate-700/50">
            <div>
              <p class="text-slate-200 text-sm font-medium">Session Timeout</p>
              <p class="text-slate-500 text-xs mt-0.5">Automatically log out inactive users</p>
            </div>
            <select [(ngModel)]="sessionTimeout" class="px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="480">8 hours</option>
            </select>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-slate-700/50">
            <div>
              <p class="text-slate-200 text-sm font-medium">Audit Log Retention</p>
              <p class="text-slate-500 text-xs mt-0.5">How long to keep audit records</p>
            </div>
            <select [(ngModel)]="logRetention" class="px-3 py-1.5 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-blue-500">
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="180">180 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="text-slate-200 text-sm font-medium">IP Allowlisting</p>
              <p class="text-slate-500 text-xs mt-0.5">Restrict access to specific IP ranges</p>
            </div>
            <button
              role="switch" [attr.aria-checked]="ipAllowlist()" (click)="ipAllowlist.set(!ipAllowlist())"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              [class]="ipAllowlist() ? 'bg-blue-600' : 'bg-slate-600'"
            >
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" [class]="ipAllowlist() ? 'translate-x-6' : 'translate-x-1'"></span>
            </button>
          </div>
        </div>
      </section>

      <!-- Notifications -->
      <section class="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5" aria-labelledby="notif-heading">
        <h2 id="notif-heading" class="text-base font-semibold text-slate-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          Notifications
        </h2>
        <div class="space-y-3">
          @for (item of notifItems; track item.key) {
            <div class="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
              <div>
                <p class="text-slate-200 text-sm">{{ item.label }}</p>
                <p class="text-slate-500 text-xs">{{ item.desc }}</p>
              </div>
              <button
                role="switch" [attr.aria-checked]="notifState()[item.key]" (click)="toggleNotif(item.key)"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                [class]="notifState()[item.key] ? 'bg-blue-600' : 'bg-slate-600'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" [class]="notifState()[item.key] ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </div>
          }
        </div>
      </section>

      <!-- API Keys -->
      <section class="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4" aria-labelledby="api-heading">
        <h2 id="api-heading" class="text-base font-semibold text-slate-100 flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          API Configuration
        </h2>
        <div class="space-y-3">
          <div>
            <label class="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider" for="webhook-url">Webhook URL</label>
            <input id="webhook-url" type="url" value="https://hooks.yourcompany.com/events" class="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-300 text-sm font-mono focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label class="block text-slate-400 text-xs font-medium mb-1.5 uppercase tracking-wider" for="api-key">API Key</label>
            <div class="relative">
              <input id="api-key" [type]="showKey() ? 'text' : 'password'" value="your-api-key-goes-here-replace-in-production" class="w-full px-3 py-2 pr-10 bg-slate-900/50 border border-slate-600 rounded-lg text-slate-300 text-sm font-mono focus:outline-none focus:border-blue-500" readonly />
              <button (click)="showKey.set(!showKey())" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300" [attr.aria-label]="showKey() ? 'Hide API key' : 'Show API key'">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  @if (showKey()) {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"/>
                  } @else {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Save Button -->
      <div class="flex justify-end gap-3">
        <button class="px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm transition-colors">
          Cancel
        </button>
        <button (click)="save()" class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  `,
})
export class SettingsComponent {
  private authService = inject(AuthService);

  orgName = 'Acme Corporation';
  timezone = 'America/Chicago';
  supportEmail = 'support@acme.com';
  domain = 'app.acme.com';
  sessionTimeout = '60';
  logRetention = '90';

  mfaEnabled = signal(true);
  ipAllowlist = signal(false);
  showKey = signal(false);
  saved = signal(false);

  notifItems = [
    { key: 'newUser', label: 'New User Created', desc: 'Alert when a new user is added to the system' },
    { key: 'securityAlert', label: 'Security Alerts', desc: 'Failed login attempts and suspicious activity' },
    { key: 'systemUpdates', label: 'System Updates', desc: 'Maintenance windows and version updates' },
    { key: 'auditDigest', label: 'Weekly Audit Digest', desc: 'Summary of audit log activity via email' },
  ];

  notifState = signal<Record<string, boolean>>({
    newUser: true, securityAlert: true, systemUpdates: false, auditDigest: true,
  });

  toggleNotif(key: string) {
    this.notifState.update(s => ({ ...s, [key]: !s[key] }));
  }

  save() {
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
