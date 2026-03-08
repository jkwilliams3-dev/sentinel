import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastComponent],
  template: `
    <div class="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      @if (isAuthenticated()) {
        <app-sidebar />
        <div class="flex-1 flex flex-col overflow-hidden">
          <app-header />
          <main class="flex-1 overflow-y-auto bg-slate-950">
            <router-outlet />
          </main>
        </div>
      } @else {
        <div class="flex-1">
          <router-outlet />
        </div>
      }
      <app-toast />
    </div>
  `,
})
export class App {
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;
}
