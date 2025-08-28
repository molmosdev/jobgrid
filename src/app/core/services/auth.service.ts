import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { SessionService } from './session.service';

/**
 * Provides high-level authentication flows (OTP, LinkedIn, session bootstrap, logout).
 *
 * Responsibilities:
 * - Computes base auth API URL.
 * - Initiates and refreshes session state via SessionService.
 * - Orchestrates recruiter passwordless (register/login + verify OTP) flows.
 * - Initiates federated (LinkedIn) login by redirect.
 * - Exposes post-auth redirect decision helper.
 *
 * This service is UI-facing; low-level session state is centralized in {@link SessionService}.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** HTTP client for backend requests. */
  private httpClient = inject(HttpClient);

  /** Resolves dynamic API base URL (environment aware). */
  apiService = inject(ApiService);

  /** Reactive base URL for auth endpoints (changes if apiService url changes). */
  readonly baseUrl = computed(() => `${this.apiService.url()}/auth`);

  /** Session service (internal). */
  private session = inject(SessionService);

  /** Reactive authenticated user (null when unauthenticated). */
  readonly user = computed(() => this.session.user());

  /** Whether the authenticated user already owns/belongs to a company. */
  readonly hasCompany = computed(() => this.session.hasCompany());

  /** True while initial /auth/user fetch is in-flight. */
  readonly isLoading = computed(() => this.session.isLoading());

  /**
   * Derived route to navigate after auth changes.
   * - null => still resolving session
   * - '/register' => unauthenticated
   * - '/create-company' => needs company
   * - '/dashboard' => fully onboarded
   */
  readonly postAuthTarget = computed(() => {
    if (this.isLoading()) return null;
    if (!this.session.isAuthenticated()) return '/register';
    if (this.session.needsCompany()) return '/create-company';
    return '/dashboard';
  });

  /** Router for imperative navigations after auth actions. */
  private router = inject(Router);

  /**
   * Initiates classic email/password login.
   *
   * @param email - User email.
   * @param password - User password.
   * @remarks On success, refreshes session and navigates to root.
   */
  logInWithEmailAndPassword(email: string, password: string): void {
    const url = `${this.baseUrl()}/login`;
    this.httpClient.post<{ message: string }>(url, { email, password }, { withCredentials: true }).subscribe({
      next: () => {
        this.getUser();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error during email/password login:', error);
      }
    });
  }

  /** Redirects browser to LinkedIn OAuth login (full page navigation). */
  logInWithLinkedIn(): void {
    const url = `${this.baseUrl()}/linkedin/login`;
    window.location.href = url;
  }

  /**
   * Initializes (or reuses) current session from backend /auth/user.
   * @returns Promise resolved when the session init pipeline finishes.
   */
  getUser(): Promise<void> {
    return this.session.init();
  }

  /** Performs logout by redirecting to backend logout endpoint. */
  logout(): void {
    const url = `${this.baseUrl()}/logout`;
    window.location.href = url;
  }

  /**
   * Requests an OTP for recruiter registration (first-time user).
   * @param name - Recruiter display name.
   * @param email - Corporate email (login identifier).
   * @returns Message describing the outcome.
   */
  async registerRecruiter(name: string, email: string): Promise<{ message: string }> {
    const url = `${this.baseUrl()}/magic-link/register`;
    return new Promise<{ message: string }>((resolve, reject) => {
      this.httpClient
        .post<{ message?: string; error?: string }>(url, { name, email }, { withCredentials: true })
        .subscribe({
          next: (res) => {
            if (res.error) return reject(new Error(res.error));
            resolve({ message: res.message || 'Verification code sent' });
          },
          error: (err) => {
            const msg = err?.error?.error || err?.message || 'Request failed';
            reject(new Error(msg));
          }
        });
    });
  }

  /**
   * Requests an OTP for existing recruiter login.
   * @param email - Corporate email already registered.
   * @returns Message describing the outcome.
   */
  async loginRecruiter(email: string): Promise<{ message: string }> {
    const url = `${this.baseUrl()}/magic-link/login`;
    return new Promise<{ message: string }>((resolve, reject) => {
      this.httpClient.post<{ message?: string; error?: string }>(url, { email }, { withCredentials: true }).subscribe({
        next: (res) => {
          if (res.error) return reject(new Error(res.error));
          resolve({ message: res.message || 'Verification code sent' });
        },
        error: (err) => {
          const msg = err?.error?.error || err?.message || 'Request failed';
          reject(new Error(msg));
        }
      });
    });
  }

  /**
   * Navigates to an appropriate route based on session state (idempotent).
   */
  decidePostAuthRedirect(): void {
    const target = this.postAuthTarget();
    if (!target) return; // still loading
    if (this.router.url !== target) this.router.navigate([target]);
  }

  /**
   * Verifies OTP (passwordless) and establishes authenticated session.
   * @param email - Email used to request the code.
   * @param code - One-time password from email.
   * @param state - Flow variant ('register' | 'login').
   * @param name - Display name (required only for register when creating a new user).
   * @returns Redirect target provided by backend.
   */
  verifyOtp(email: string, code: string, state: 'register' | 'login', name?: string): Promise<{ redirect: string }> {
    const url = `${this.baseUrl()}/passwordless/verify`;
    return new Promise((resolve, reject) => {
      this.httpClient
        .post<{
          redirect: string;
          message?: string;
          error?: string;
        }>(url, { email, code, state, name }, { withCredentials: true })
        .subscribe({
          next: async (res) => {
            if (res.error) return reject(new Error(res.error));
            // refresh session so signals update
            await this.session.refresh();
            resolve({ redirect: res.redirect });
          },
          error: (err) => reject(new Error(err?.error?.error || err.message || 'Verification failed'))
        });
    });
  }
}
