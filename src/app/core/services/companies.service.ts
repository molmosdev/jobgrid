import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Company } from '../../shared/interfaces/company.interface';

/**
 * Service for handling company-related operations.
 */
@Injectable({
  providedIn: 'root'
})
export class CompaniesService {
  /**
   * HttpClient instance for making HTTP requests.
   */
  private http = inject(HttpClient);

  /**
   * ApiService instance for resolving API URLs.
   */
  apiService = inject(ApiService);
  /**
   * The base URL for the companies API endpoints.
   */
  readonly baseUrl = computed(() => `${this.apiService.url()}/companies`);

  /**
   * Registers a new company in the backend.
   * @param company - The company data to register.
   * @returns An observable with the created company.
   */
  registerCompany(formData: FormData): Observable<Company> {
    return this.http
      .post<{ company: Company }>(this.baseUrl(), formData)
      .pipe(map((response: { company: Company }) => response.company));
  }
}
