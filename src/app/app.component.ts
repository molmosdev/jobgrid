import { Component, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';

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

  login() {
    this.authService.logInWithLinkedIn();
  }
}
