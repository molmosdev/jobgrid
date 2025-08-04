import { Component, computed, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { User } from './shared/interfaces/user';
import { RouterOutlet } from '@angular/router';

/**
 * Root component of the JobGrid application.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export default class AppComponent {
  title = 'JobGrid';
  authService = inject(AuthService);
  readonly user = computed<User | null>(() => this.authService.user());

  login() {
    this.authService.logInWithLinkedIn();
  }

  logout() {
    this.authService.logout();
  }
}
