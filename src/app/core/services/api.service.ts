import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly host = signal(window.location.hostname);
  readonly url = computed(() => (environment.production ? `https://api.${this.host()}` : 'http://localhost:8787'));
  readonly jobgridUrl = computed(() => (environment.production ? 'https://api.jobgrid.app' : 'http://localhost:8787'));
}
