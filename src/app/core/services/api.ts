import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  /** Platform identifier (browser vs server). */
  private readonly platformId = inject(PLATFORM_ID);

  /** Hostname used to build the API base URL (set only in browser). */
  readonly host = signal<string>(
    isPlatformBrowser(this.platformId) && typeof window !== 'undefined' ? window.location.hostname : '',
  );

  /**
   * Base API URL (as a computed signal). Invoke with `this.api.url()` to get the
   * current string value.
   */
  readonly url = computed(() =>
    environment.production ? `https://api.${this.host() || 'localhost'}` : 'http://localhost:8787',
  );
}
