import { Routes } from '@angular/router';
import { marketingRoutes } from './features/marketing/marketing.routes';
import { platformRoutes } from './features/platform/platform.routes';

export const routes: Routes = [
  {
    path: '',
    children: marketingRoutes,
  },
  {
    path: '',
    children: platformRoutes,
  },
  { path: '**', loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound) },
];
