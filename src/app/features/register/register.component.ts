import { Component } from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  CardContentComponent,
  CardFooterComponent,
  InputGroupComponent
} from '@basis-ng/primitives';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [
    InputComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardFooterComponent,
    InputGroupComponent,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export default class RegisterComponent {
  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    domain: new FormControl('', Validators.required),
    subdomain: new FormControl('', Validators.required)
  });

  onSubmit() {
    this.registerForm.markAllAsTouched();
  }
}
