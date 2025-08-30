import { Routes } from '@angular/router';
import { authenticatedGuard } from '@core/guards/authenticated-guard';
import { unauthenticatedGuard } from '@core/guards/unauthenticated-guard';
import { authRoutes } from './auth/auth.routes';
import { dashboardRoutes } from './dashboard/dashboard.routes';

export const platformRoutes: Routes = [
  { path: 'auth', canMatch: [unauthenticatedGuard], children: authRoutes },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    canMatch: [authenticatedGuard],
    children: dashboardRoutes,
  },
];
