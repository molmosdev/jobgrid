import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../../shared/interfaces/user.interface';

/** Central session snapshot (bootstraps /auth/user once, exposes reactive state). */
@Injectable({ providedIn: 'root' })
export class SessionService {
  /** Angular HTTP client (low-level). */
  private http = inject(HttpClient);

  /** API service (provides base URL). */
  private api = inject(ApiService);

  /** Auth base path. */
  readonly baseUrl = computed(() => `${this.api.url()}/auth`);

  /** Current user (null if unauthenticated). */
  readonly user = signal<User | null>(null);

  /** Indicates company association. */
  readonly hasCompany = signal<boolean>(false);

  /** Loading state while bootstrapping. */
  readonly isLoading = signal<boolean>(false);

  /** True after first bootstrap attempt completes. */
  readonly isReady = signal<boolean>(false);

  /** True if user present. */
  readonly isAuthenticated = computed(() => !!this.user());

  /** True if authenticated but missing company. */
  readonly needsCompany = computed(() => this.isAuthenticated() && !this.hasCompany());

  /** Ready + not authenticated. */
  readonly readyAndUnauthenticated = computed(() => this.isReady() && !this.isAuthenticated());

  /** Internal guard to avoid duplicate bootstrap calls. */
  private initialized = false;

  /** Memoized promise of the in-flight bootstrap (null when idle). */
  private initPromise: Promise<void> | null = null;

  /**
   * Bootstraps session (idempotent).
   * @returns Promise<void> - resolves after first /auth/user attempt (success or 401).
   */
  init(): Promise<void> {
    if (this.initialized) return this.initPromise || Promise.resolve();
    this.initialized = true;
    this.isLoading.set(true);
    const url = `${this.baseUrl()}/user`;
    this.initPromise = new Promise<void>((resolve) => {
      this.http.get<{ user: User; hasCompany: boolean }>(url, { withCredentials: true }).subscribe({
        next: (res) => {
          this.user.set(res.user);
          this.hasCompany.set(res.hasCompany);
          this.isLoading.set(false);
          this.isReady.set(true);
          resolve();
        },
        error: () => {
          this.user.set(null);
          this.hasCompany.set(false);
          this.isLoading.set(false);
          this.isReady.set(true);
          resolve();
        }
      });
    });
    return this.initPromise;
  }

  /**
   * Forces a re-bootstrap (clears cached state and re-runs init).
   * @returns Promise<void> - resolves when fresh user state loaded.
   */
  refresh(): Promise<void> {
    this.initialized = false;
    this.isReady.set(false);
    return this.init();
  }
}
