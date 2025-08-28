import { Routes } from '@angular/router';
import { AuthenticatedGuard } from './core/guards/authenticated.guard';
import { HasCompanyGuard } from './core/guards/has-company.guard';
import { NeedsCompanyGuard } from './core/guards/needs-company.guard';
import { UnauthenticatedGuard } from './core/guards/unauthenticated.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [AuthenticatedGuard, HasCompanyGuard],
    loadComponent: () => import('./features/cooming-soon/cooming-soon.component')
  },
  {
    path: 'register',
    canActivate: [UnauthenticatedGuard],
    loadComponent: () => import('./features/register/register.component')
  },
  {
    path: 'create-company',
    canActivate: [AuthenticatedGuard, NeedsCompanyGuard],
    loadComponent: () => import('./features/create-company/create-company.component')
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component')
  }
];
