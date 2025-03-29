import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    canActivate: [AuthGuard] // Apply the guard here
  }
];
