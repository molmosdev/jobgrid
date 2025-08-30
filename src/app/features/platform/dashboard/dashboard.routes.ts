import { Routes } from '@angular/router';
import { recruiterWithCompanyGuard } from '@core/guards/recruiter-with-company-guard';
import { recruiterWithoutCompanyGuard } from '@core/guards/recruiter-without-company-guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'create-company',
    loadComponent: () => import('./pages/create-company/create-company').then((m) => m.CreateCompany),
    canActivate: [recruiterWithoutCompanyGuard],
  },
  {
    path: 'overview',
    loadComponent: () => import('./pages/overview/overview').then((m) => m.Overview),
    canActivate: [recruiterWithCompanyGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings),
    canActivate: [recruiterWithCompanyGuard],
  },
];
