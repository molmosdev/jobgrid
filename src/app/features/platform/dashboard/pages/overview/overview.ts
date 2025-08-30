import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@basis-ng/primitives';
import { Auth } from '@core/services/auth';

@Component({
  selector: 'app-overview',
  imports: [JsonPipe, ButtonComponent],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Overview {
  auth = inject(Auth);
}
