import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './core/services/auth.service';

/**
 * Root component of the JobGrid application.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'JobGrid';
  authService = inject(AuthService);
  route = inject(ActivatedRoute);
  accessToken: string | null = null;
  readonly user = computed(() => this.authService.user());

  /**
   * Initializes the component and handles LinkedIn access token from the URL fragment.
   */
  ngOnInit(): void {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');

        if (accessToken) {
          this.authService.startUserSession(accessToken);
        }
      }
    });
  }

  /**
   * Initiates the LinkedIn login process.
   */
  logInWithLinkedIn(): void {
    this.authService.logInWithLinkedIn();
  }
}
