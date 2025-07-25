import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../../shared/interfaces/user';
import { Router } from '@angular/router';
import { ApiService } from './api.service';

/**
 * Service for handling authentication-related operations.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);
  apiService = inject(ApiService);
  readonly baseUrl = computed(() => `${this.apiService.url()}/auth`);
  readonly user = signal<User | null>(null);
  readonly isLoading = signal(true);
  private router = inject(Router);

  /**
   * Logs in the user using email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   */
  logInWithEmailAndPassword(email: string, password: string): void {
    const url = `${this.baseUrl()}/login`;
    this.httpClient.post<{ message: string }>(url, { email, password }, { withCredentials: true }).subscribe({
      next: () => {
        this.getUser();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error during email/password login:', error);
      }
    });
  }

  /**
   * Redirects the user to the LinkedIn login page.
   */
  logInWithLinkedIn(): void {
    const url = `${this.baseUrl()}/linkedin/login`;
    window.location.href = url;
  }

  /**
   * Fetches the authenticated user's data and updates the user signal.
   * If the user is already set, it does nothing.
   */
  getUser(): void {
    if (this.user()) {
      this.isLoading.set(false);
      return;
    }

    const url = `${this.baseUrl()}/user`;
    this.httpClient.get<User>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.user.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Logs the user out by clearing the session and user data.
   */
  logout(): void {
    const url = `${this.baseUrl()}/logout`;
    window.location.href = url;
  }
}
