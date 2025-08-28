import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Resolves API base URL (reactive) based on environment + current hostname.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  /** Current browser hostname. */
  readonly host = signal(window.location.hostname);

  /** Resolved API base URL. */
  readonly url = computed(() => (environment.production ? `https://api.${this.host()}` : 'http://localhost:8787'));
}
