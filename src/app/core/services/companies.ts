import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Company } from '@shared/interfaces/company.interface';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Companies {
  /**
   * API service providing the base API URL. Used to build auth endpoints.
   */
  api = inject(Api);

  /** Low‑level Angular HTTP client used for authentication requests. */
  http = inject(HttpClient);

  /**
   * Base URL (signal) for all authentication endpoints, derived from the API base URL.
   * Example: `https://api.example.com/auth` (prod) or `http://localhost:8787/auth` (dev).
   */
  baseUrl = computed(() => `${this.api.url()}/auth`);

  /**
   * Creates a company and returns the created entity.
   *
   * @param company - Company fields + optional assets.
   * @returns Created company.
   */
  async registerCompany(company: Company): Promise<Company> {
    const response = await firstValueFrom(
      this.http.post<{ company: Company }>(this.baseUrl(), { company }, { withCredentials: true }),
    );
    return response.company;
  }
}
