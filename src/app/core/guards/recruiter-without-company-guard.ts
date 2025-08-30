import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '@core/services/auth';

export const recruiterWithoutCompanyGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);

  return !auth.isRecruiterAndHasNoCompany() ? router.createUrlTree(['/dashboard']) : true;
};
