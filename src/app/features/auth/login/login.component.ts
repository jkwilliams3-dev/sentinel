import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div class="w-full max-w-md">
        <!-- Branding -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <svg class="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-slate-100">Sentinel</h1>
          <p class="text-slate-400 mt-1 text-sm">Management Platform</p>
        </div>

        <!-- Card -->
        <div class="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <h2 class="text-xl font-semibold text-slate-100 mb-6">Sign in to your account</h2>

          @if (errorMessage()) {
            <div
              class="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm"
              role="alert"
              aria-live="assertive"
            >
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <!-- Email -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="you@forge.dev"
                [class]="emailError ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-teal-400'"
                class="w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition"
                aria-label="Email address"
                [attr.aria-invalid]="emailError ? 'true' : 'false'"
                [attr.aria-describedby]="emailError ? 'email-error' : null"
              />
              @if (emailError) {
                <p id="email-error" class="mt-1.5 text-xs text-red-400" role="alert">{{ emailError }}</p>
              }
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label for="password" class="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div class="relative">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  placeholder="Enter your password"
                  [class]="passwordError ? 'border-red-500 focus:ring-red-500' : 'border-slate-600 focus:ring-teal-400'"
                  class="w-full px-3 py-2.5 bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition pr-10"
                  aria-label="Password"
                  [attr.aria-invalid]="passwordError ? 'true' : 'false'"
                  [attr.aria-describedby]="passwordError ? 'password-error' : null"
                />
                <button
                  type="button"
                  (click)="showPassword.update(v => !v)"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
              @if (passwordError) {
                <p id="password-error" class="mt-1.5 text-xs text-red-400" role="alert">{{ passwordError }}</p>
              }
            </div>

            <!-- Remember me -->
            <div class="flex items-center mb-6">
              <input
                id="remember"
                type="checkbox"
                formControlName="remember"
                class="w-4 h-4 bg-slate-900 border-slate-600 rounded text-blue-600 focus:ring-teal-400 focus:ring-offset-slate-800"
              />
              <label for="remember" class="ml-2 text-sm text-slate-400">Remember me</label>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 flex items-center justify-center gap-2"
              aria-label="Sign in to Sentinel"
            >
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              } @else {
                <span>Sign in</span>
              }
            </button>
          </form>

          <!-- Demo credentials -->
          <div class="mt-6 pt-6 border-t border-slate-700">
            <p class="text-slate-500 text-xs font-medium mb-3 uppercase tracking-wide">Demo Credentials</p>
            <div class="space-y-2">
              @for (cred of demoCreds; track cred.email) {
                <button
                  type="button"
                  (click)="fillCredentials(cred.email, cred.password)"
                  class="w-full flex items-center justify-between px-3 py-2 bg-slate-900/50 hover:bg-slate-700 rounded-lg transition-colors group"
                  [attr.aria-label]="'Use ' + cred.role + ' credentials'"
                >
                  <span class="text-slate-400 text-xs">{{ cred.email }}</span>
                  <span [class]="cred.badgeClass" class="text-xs px-2 py-0.5 rounded-full font-medium">{{ cred.role }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false],
  });

  demoCreds = [
    { email: 'admin@forge.dev', password: 'Admin123!', role: 'Admin', badgeClass: 'bg-blue-900/50 text-teal-400 border border-teal-700/50' },
    { email: 'manager@forge.dev', password: 'Manager123!', role: 'Manager', badgeClass: 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50' },
    { email: 'viewer@forge.dev', password: 'Viewer123!', role: 'Viewer', badgeClass: 'bg-slate-700/50 text-slate-400 border border-slate-600/50' },
  ];

  get emailError(): string {
    const ctrl = this.loginForm.get('email');
    if (!ctrl?.touched || !ctrl.invalid) return '';
    if (ctrl.errors?.['required']) return 'Email is required.';
    if (ctrl.errors?.['email']) return 'Please enter a valid email address.';
    return '';
  }

  get passwordError(): string {
    const ctrl = this.loginForm.get('password');
    if (!ctrl?.touched || !ctrl.invalid) return '';
    if (ctrl.errors?.['required']) return 'Password is required.';
    if (ctrl.errors?.['minlength']) return 'Password must be at least 6 characters.';
    return '';
  }

  fillCredentials(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  async onSubmit(): Promise<void> {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;
    const result = await this.authService.login(email!, password!);

    this.loading.set(false);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set(result.error ?? 'Login failed.');
    }
  }
}
