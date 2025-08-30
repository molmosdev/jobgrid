import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@shared/interfaces/user.interface';
import { Api } from './api';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  /**
   * API service providing the base API URL. Used to build auth endpoints.
   */
  api = inject(Api);

  /** Low‑level Angular HTTP client used for authentication requests. */
  http = inject(HttpClient);

  /** Router used for post‑login navigation and redirects. */
  router = inject(Router);

  /**
   * Base URL (signal) for all authentication endpoints, derived from the API base URL.
   * Example: `https://api.example.com/auth` (prod) or `http://localhost:8787/auth` (dev).
   */
  baseUrl = computed(() => `${this.api.url()}/auth`);

  /**
   * Current authenticated user resource (null when unauthenticated).
   * Call `this.user.reload()` to refetch server state.
   */
  user = signal<User | null>(null);

  /** Convenience signal indicating whether the current user has recruiter role. */
  isRecruiter = computed(() => this.user()?.type === 'recruiter');

  /** Convenience signal indicating whether the current user has seeker role. */
  isSeeker = computed(() => this.user()?.type === 'seeker');

  /** True when user is a recruiter and has not yet associated a company. */
  isRecruiterAndHasNoCompany = computed(() => this.isRecruiter() && !this.user()?.company);

  /**
   * Loads the current user from the server.
   *
   * @returns A promise that resolves when the user is loaded, or rejects on error.
   */
  loadUser(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.http.get<User>(`${this.baseUrl()}/user`, { withCredentials: true }).subscribe({
        next: (user) => {
          this.user.set(user);
          resolve();
        },
        error: () => {
          this.user.set(null);
          resolve();
        },
      });
    });
  }

  /**
   * Email / password login flow.
   * On success: reloads user resource and navigates to `/dashboard`.
   * Errors are logged to console (you may extend to surface UI feedback).
   *
   * @param email - User email.
   * @param password - Plain password.
   */
  logInWithEmailAndPassword(email: string, password: string): void {
    const url = `${this.baseUrl()}/login`;
    this.http.post<{ message: string }>(url, { email, password }, { withCredentials: true }).subscribe({
      next: () => {
        this.loadUser();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error during email/password login:', error);
      },
    });
  }

  /**
   * Initiates LinkedIn OAuth login by redirecting the browser to the backend endpoint.
   */
  logInWithLinkedIn(): void {
    const url = `${this.baseUrl()}/linkedin/login`;
    window.location.href = url;
  }

  /**
   * Logs out the current user by clearing local user state and hitting the logout endpoint.
   * Performs a full page redirect (server will clear session / cookies).
   */
  logout(): void {
    const url = `${this.baseUrl()}/logout`;
    this.user.set(null);
    window.location.href = url;
  }

  /**
   * Starts recruiter registration (sends magic link / OTP).
   * @param name Recruiter name.
   * @param email Recruiter email.
   */
  async registerRecruiter(name: string, email: string) {
    return this.magicLinkRequest('/magic-link/register', { name, email });
  }

  /**
   * Starts recruiter login (passwordless magic link / OTP).
   * @param email Recruiter email.
   */
  async loginRecruiter(email: string) {
    return this.magicLinkRequest('/magic-link/login', { email });
  }

  /**
   * Sends a passwordless (magic‑link / OTP) POST to an auth sub-endpoint.
   *
   * @param endpoint - Relative path starting with '/' (e.g. '/magic-link/register').
   * @param body - Payload to send.
   * @returns Promise<void> Resolves when request completes successfully, rejects on error.
   * @throws Error on backend or network failure.
   */
  private magicLinkRequest(endpoint: string, body: Record<string, unknown>): Promise<void> {
    const url = `${this.baseUrl()}${endpoint}`;
    return new Promise<void>((resolve, reject) => {
      this.http.post<{ message?: string; error?: string }>(url, body, { withCredentials: true }).subscribe({
        next: () => resolve(),
        error: (err) => {
          console.error('Magic link error:', err);
          reject(err);
        },
      });
    });
  }

  /**
   * Verifies an OTP / magic code for recruiter registration or login.
   * Reloads the user resource on success and resolves with a redirect path
   * (the backend decides the appropriate post‑verification route).
   *
   * @param email - Email used in the flow.
   * @param code - One‑time verification code.
   * @param state - Whether this is a 'register' or 'login' verification.
   * @param name - Optional recruiter name (required for registration flows server‑side).
   * @returns Promise resolving with an object containing `redirect` route.
   */
  verifyOtp(email: string, code: string, state: 'register' | 'login', name?: string): Promise<void> {
    const url = `${this.baseUrl()}/passwordless/verify`;
    return new Promise((resolve, reject) => {
      this.http
        .post<{
          redirect: string;
          message?: string;
          error?: string;
        }>(url, { email, code, state, name }, { withCredentials: true })
        .subscribe({
          next: async () => {
            this.loadUser();
            resolve();
          },
          error: (err) => {
            console.error('Verification failed:', err);
            reject(err);
          },
        });
    });
  }
}
