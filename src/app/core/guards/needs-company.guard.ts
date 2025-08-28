import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/** Allows only users without company; redirects owners to '/' (assumes prior auth guard). */
@Injectable({ providedIn: 'root' })
export class NeedsCompanyGuard implements CanActivate {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  canActivate(): boolean {
    if (this.session.hasCompany()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
