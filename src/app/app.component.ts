import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export interface UserMetadata {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  iss: string;
  locale: string;
  name: string;
  phone_verified: boolean;
  picture: string;
  provider_id: string;
  sub: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'JobGrid';
  httpClient = inject(HttpClient);
  route = inject(ActivatedRoute);
  baseUrl = 'http://api.jobgrid.app/api/v1/';
  accessToken: string | null = null;
  readonly userMetadata = signal<UserMetadata | null>(null);

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        this.accessToken = params.get('access_token');

        if (this.accessToken) {
          this.startUserSession(this.accessToken);
        }
      }
    });
  }

  startUserSession(token: string) {
    const url = `${this.baseUrl}auth/startUserSession`;
    this.httpClient.get(url, { params: { access_token: token }, withCredentials: true }).subscribe({
      next: () => {
        this.getUser();
      },
      error: (error) => {
        console.error('Error setting access token as cookie:', error);
      }
    });
  }

  getUser() {
    const url = `${this.baseUrl}auth/user`;
    this.httpClient.get<{ user_metadata: UserMetadata }>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        const userMetadata = response.user_metadata;
        this.userMetadata.set(userMetadata);
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });
  }

  logInWithLinkedIn() {
    const url = `${this.baseUrl}auth/loginWithLinkedIn`;
    window.location.href = url;
  }
}
