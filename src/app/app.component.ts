import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from './core/services/auth.service';

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

  ngOnInit() {
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

  logInWithLinkedIn() {
    this.authService.logInWithLinkedIn();
  }
}
