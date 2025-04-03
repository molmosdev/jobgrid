import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccessTokenHandlerService {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  constructor() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const access = params.get('access_token');

        if (access) {
          this.authService.startUserSession(access);
        }
      }
    });
  }
}
