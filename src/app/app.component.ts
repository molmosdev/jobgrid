import { Component, computed, inject, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
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
  title = 'JobGrid';
  authService = inject(AuthService);
  readonly user = computed<User | null>(() => this.authService.user());
  themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.applyTheme('light');
  }

  login() {
    this.authService.logInWithLinkedIn();
  }

  logout() {
    this.authService.logout();
  }
}
