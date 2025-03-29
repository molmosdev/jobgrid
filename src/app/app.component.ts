import { Component, computed, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { AccessTokenHandlerService } from './core/services/access-token-handler.service';
import { FormsModule } from '@angular/forms';

/**
 * Root component of the JobGrid application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [FormsModule]
})
export class AppComponent {
  title = 'JobGrid';
  email = '';
  password = '';
  authService = inject(AuthService);
  accessTokenHandlerService = inject(AccessTokenHandlerService);
  readonly user = computed(() => this.authService.user());
  readonly isLoading = computed(() => this.authService.isLoading());

  /**
   * Initiates the LinkedIn login process.
   */
  logInWithLinkedIn(): void {
    this.authService.logInWithLinkedIn();
  }

  /**
   * Handles login with email and password.
   */
  logIn(): void {
    if (this.email && this.password) {
      this.authService.logInWithEmailAndPassword(this.email, this.password);
    } else {
      console.error('Email and password are required');
    }
  }

  /**
   * Logs the user out and clears the session.
   */
  logOut(): void {
    this.authService.logOut();
  }
}
