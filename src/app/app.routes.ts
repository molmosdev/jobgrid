import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/cooming-soon/cooming-soon.component')
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register.component')
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component')
  }
];
