import { Component, computed, inject, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { SessionService } from './core/services/session.service';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '@basis-ng/primitives';
import { User } from './shared/interfaces/user.interface';

/**
 * Root component of the JobGrid application.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export default class AppComponent implements OnInit {
  /** App title (display use). */
  title = 'JobGrid';

  /** Auth service (login/logout + user signal). */
  authService = inject(AuthService);

  /** Session service (bootstrapped state). */
  session = inject(SessionService);

  /** Current user (null if unauthenticated). */
  readonly user = computed<User | null>(() => this.authService.user());

  /** Theme service (applies global theme). */
  themeService = inject(ThemeService);

  /** True once initial session fetch completed. */
  readonly isReady = computed(() => this.session.isReady());

  ngOnInit(): void {
    this.themeService.applyTheme('light');
  }

  /** Trigger LinkedIn login flow. */
  login(): void {
    this.authService.logInWithLinkedIn();
  }

  /** Logout current user. */
  logout(): void {
    this.authService.logout();
  }
}
