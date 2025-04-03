import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/interfaces/user';
import { Router } from '@angular/router';

/**
 * Service for handling authentication-related operations.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  readonly user = signal<User | null>(null);
  readonly isLoading = signal(true);
  private router = inject(Router);

  /**
   * Redirects the user to the LinkedIn login page.
   */
  logInWithLinkedIn(): void {
    const url = `${this.baseUrl}/loginWithLinkedIn`;
    window.location.href = url;
  }

  /**
   * Starts a user session by setting the access token as a cookie.
   * @param token - The access token received from LinkedIn.
   */
  startUserSession(token: string): void {
    const url = `${this.baseUrl}/startUserSession`;
    this.httpClient.get(url, { params: { access_token: token }, withCredentials: true }).subscribe({
      next: () => {
        this.getUser();
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error setting access token as cookie:', error);
      }
    });
  }

  /**
   * Logs in the user using email and password.
   * @param email - The user's email.
   * @param password - The user's password.
   */
  logInWithEmailAndPassword(email: string, password: string): void {
    const url = `${this.baseUrl}/loginWithEmailAndPassword`;
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
   * Fetches the authenticated user's data and updates the user signal.
   * If the user is already set, it does nothing.
   */
  getUser(): void {
    if (this.user()) {
      this.isLoading.set(false);
      return;
    }

    const url = `${this.baseUrl}/user`;
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
  logOut(): void {
    const url = `${this.baseUrl}/logout`;
    this.httpClient.get(url, { withCredentials: true }).subscribe({
      next: () => {
        this.user.set(null);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Error during logout:', error);
      }
    });
  }
}
