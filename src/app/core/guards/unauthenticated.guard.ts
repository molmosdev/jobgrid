import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

/** Allows only unauthenticated users; redirects authenticated to '/dashboard'. Initializes session if needed. */
@Injectable({ providedIn: 'root' })
export class UnauthenticatedGuard implements CanActivate {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  async canActivate(): Promise<boolean> {
    if (!this.session.isReady()) await this.session.init();
    if (this.session.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
