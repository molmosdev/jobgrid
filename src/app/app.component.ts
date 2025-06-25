import { Component, computed, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { User } from './shared/interfaces/user';
import { JsonPipe } from '@angular/common';

/**
 * Root component of the JobGrid application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [JsonPipe]
})
export class AppComponent {
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
