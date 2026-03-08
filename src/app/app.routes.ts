import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
  },
  {
    path: 'users/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent),
  },
  {
    path: 'audit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/audit/audit-log.component').then(m => m.AuditLogComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  { path: '**', redirectTo: '/login' },
];
