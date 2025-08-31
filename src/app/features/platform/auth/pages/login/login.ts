import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardDescriptionComponent,
  CardFooterComponent,
  CardHeaderComponent,
  CardTitleComponent,
  InputComponent,
  OtpComponent,
  OtpDigitDirective,
  SpinnerComponent,
  TranslatePipe,
} from '@basis-ng/primitives';
import { Auth } from '@core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    CardFooterComponent,
    InputComponent,
    OtpComponent,
    OtpDigitDirective,
    ButtonComponent,
    ReactiveFormsModule,
    SpinnerComponent,
    TranslatePipe,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  /** Auth service for authentication logic. */
  auth = inject(Auth);

  /** Router for navigation after successful login. */
  router = inject(Router);

  /**
   * Email form group for recruiter login.
   * Validates required, email format, and blocks free email domains.
   */
  emailForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      (control: import('@angular/forms').AbstractControl) => {
        const value = control.value;
        if (!value) return null;
        const domain = value.split('@')[1]?.toLowerCase();
        if (
          domain &&
          [
            'gmail.com',
            'googlemail.com',
            'outlook.com',
            'hotmail.com',
            'live.com',
            'msn.com',
            'yahoo.com',
            'yahoo.es',
            'aol.com',
            'icloud.com',
            'me.com',
            'proton.me',
            'protonmail.com',
            'gmx.com',
            'zoho.com',
            'yandex.com',
            'mail.com',
          ].includes(domain)
        ) {
          return { freeEmailDomain: true };
        }
        return null;
      },
    ]),
  });

  /** OTP form group for recruiter login verification. */
  otpForm = new FormGroup({
    otp: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
  });

  /** Reference to the first OTP input element for focus management. */
  firstOtpInput = viewChild<ElementRef>('firstOtpInput');

  /** State signal for email sending: 'idle', 'sending', or 'sent'. */
  optEmailState = signal<'idle' | 'sending' | 'sent'>('idle');

  /** State signal for OTP verification: 'idle' or 'sending'. */
  optVerificationState = signal<'idle' | 'sending'>('idle');

  /**
   * Sends recruiter login email (magic link/OTP).
   * Validates email form and triggers loginRecruiter in Auth service.
   * On success, sets state and focuses OTP input.
   */
  sendEmail(): void {
    this.emailForm.markAllAsTouched();
    const email = this.emailForm.value.email;

    if (!this.emailForm.valid || !email) return;
    this.optEmailState.set('sending');

    this.auth.loginRecruiter(email).then(() => {
      this.optEmailState.set('sent');
      setTimeout(() => this.firstOtpInput()?.nativeElement.focus());
    });
  }

  /**
   * Sends OTP code for recruiter login verification.
   * Validates OTP form and triggers verifyOtp in Auth service.
   * On success, navigates to dashboard after a short delay.
   */
  sendOtp(): void {
    this.otpForm.markAllAsTouched();
    const email = this.emailForm.value.email;
    const otp = this.otpForm.value.otp;

    if (!email || !otp || !this.otpForm.valid) return;
    this.optVerificationState.set('sending');

    this.auth.verifyOtp(email, otp, 'login').then(() => {
      setTimeout(() => this.router.navigate(['/dashboard']), 2000);
    });
  }
}
