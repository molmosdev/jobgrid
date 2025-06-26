import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  readonly url = signal(this.resolveApiUrl());

  resolveApiUrl(): string {
    let apiUrl = '';
    const host = window.location.hostname;

    if (environment.production) {
      if (host.endsWith('jobgrid.app')) {
        apiUrl = 'https://api.jobgrid.app';
      } else {
        apiUrl = 'https://api.' + host;
      }
    } else {
      apiUrl = 'http://localhost:8787';
    }

    return apiUrl;
  }
}
