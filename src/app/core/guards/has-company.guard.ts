import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/** Requires company; redirects to '/create-company' when absent (assumes prior auth guard). */
@Injectable({ providedIn: 'root' })
export class HasCompanyGuard implements CanActivate {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  canActivate(): boolean {
    if (!this.session.hasCompany()) {
      this.router.navigate(['/create-company']);
      return false;
    }
    return true;
  }
}
