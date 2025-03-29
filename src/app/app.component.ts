import { Component, computed, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { AccessTokenHandlerService } from './core/services/access-token-handler.service';

/**
 * Root component of the JobGrid application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'JobGrid';
  authService = inject(AuthService);
  accessTokenHandlerService = inject(AccessTokenHandlerService);
  readonly user = computed(() => this.authService.user());

  /**
   * Initiates the LinkedIn login process.
   */
  logInWithLinkedIn(): void {
    this.authService.logInWithLinkedIn();
  }

  /**
   * Logs the user out and clears the session.
   */
  logOut(): void {
    this.authService.logOut();
  }
}
