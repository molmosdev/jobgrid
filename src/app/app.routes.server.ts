import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'coming-soon', renderMode: RenderMode.Server },
  { path: 'home', renderMode: RenderMode.Server },
  { path: 'auth', renderMode: RenderMode.Server },
  { path: 'auth/login', renderMode: RenderMode.Server },
  { path: 'auth/register', renderMode: RenderMode.Server },
  { path: 'dashboard', renderMode: RenderMode.Server },
  { path: 'dashboard/create-company', renderMode: RenderMode.Server },
  { path: 'dashboard/overview', renderMode: RenderMode.Server },
  { path: 'dashboard/settings', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Client },
];
