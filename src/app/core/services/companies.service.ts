import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Company } from '../../shared/interfaces/company.interface';

/** Provides company related API operations. */
@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  /** Low-level HTTP client. */
  private http = inject(HttpClient);

  /** API service for base URL resolution. */
  apiService = inject(ApiService);

  /** Base companies endpoint URL. */
  readonly baseUrl = computed(() => `${this.apiService.url()}/companies`);

  /**
   * Creates a company.
   * @param formData - multipart form (fields: name, domain, subdomain, logo?, favicon?).
   * @returns Observable emitting created company.
   */
  registerCompany(formData: FormData): Observable<Company> {
    return this.http
      .post<{ company: Company }>(this.baseUrl(), formData, { withCredentials: true })
      .pipe(map((response: { company: Company }) => response.company));
  }
}
