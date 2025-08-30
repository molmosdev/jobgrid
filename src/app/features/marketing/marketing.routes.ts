import { Routes } from '@angular/router';

export const marketingRoutes: Routes = [
  { path: '', redirectTo: 'coming-soon', pathMatch: 'full' },
  { path: 'coming-soon', loadComponent: () => import('./pages/coming-soon/coming-soon').then((m) => m.ComingSoon) },
  { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
];
