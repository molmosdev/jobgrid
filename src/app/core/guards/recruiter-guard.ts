import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '@core/services/auth';

export const recruiterGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isRecruiter() ? true : router.createUrlTree(['recruiter-onboarding/register']);
};
