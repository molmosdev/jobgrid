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
   * Fetches the authenticated user's data and updates the user signal.
   */
  getUser(): void {
    const url = `${this.baseUrl}/user`;
    this.httpClient.get<User>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.user.set(response);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });
  }
}
