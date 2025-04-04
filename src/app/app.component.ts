import { Component, computed, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { User } from './shared/interfaces/user';

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
  readonly user = computed<User | null>(() => this.authService.user());

  logInWithLinkedIn() {
    this.authService.logInWithLinkedIn();
  }
}
