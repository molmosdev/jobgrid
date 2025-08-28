import { Component, computed, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  CardComponent,
  InputComponent,
  CardContentComponent,
  CardFooterComponent
} from '@basis-ng/primitives';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

/** Recruiter registration (OTP email verification + code input). */
@Component({
  selector: 'app-register',
  imports: [
    InputComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardFooterComponent,
    ReactiveFormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export default class RegisterComponent {
  /** Register form (name + email + verification code). */
  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, (c) => this.corporateEmailValidator(c)]),
    code: new FormControl('') // added later when sent
  });

  /** Auth service (OTP + redirect logic). */
  private auth = inject(AuthService);

  /** True while magic link being requested. */
  readonly sending = signal(false);

  /** True after code sent. */
  readonly sent = signal(false);

  /** True while verifying code. */
  readonly verifying = signal(false);

  /** True when code verified. */
  readonly verified = signal(false);

  /** Error message for send/verify actions. */
  readonly errorMsg = signal<string | null>(null);

  /** Derived email domain (used for free-domain validation feedback). */
  readonly emailDomain = computed(() => {
    const email = this.registerForm.get('email')?.value || '';
    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : '';
  });

  /** Free email domains blacklist (disallowed for corporate signup). */
  private readonly freeDomains = new Set([
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
    'mail.com'
  ]);

  /**
   * Disallow free/public email domains (corporate requirement).
   * @param control - email form control.
   * @returns ValidationErrors|null - freeDomain error or null.
   */
  private corporateEmailValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '') as string;
    if (!value.includes('@')) return null; // handled by email validator separately
    const domain = value.split('@')[1]?.toLowerCase();
    if (domain && this.freeDomains.has(domain)) {
      return { freeDomain: true };
    }
    return null;
  }

  /** Send magic link / code email (first step). */
  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid || this.sending() || this.sent()) {
      return;
    }
    this.errorMsg.set(null);
    const name = this.registerForm.get('name')?.value as string;
    const email = this.registerForm.get('email')?.value as string;
    this.sending.set(true);
    this.auth
      .registerRecruiter(name, email)
      .then(() => {
        this.sending.set(false);
        this.sent.set(true);
        // enable code validation
        this.registerForm.get('code')?.addValidators([Validators.required, Validators.minLength(4)]);
        this.registerForm.get('code')?.updateValueAndValidity();
      })
      .catch((err: Error) => {
        this.sending.set(false);
        this.errorMsg.set(err.message || 'Error sending magic link');
      });
  }

  /** Verify OTP code and perform post-auth redirect. */
  verifyCode(): void {
    if (this.verifying() || !this.sent()) return;
    this.registerForm.get('code')?.markAsTouched();
    if (this.registerForm.get('code')?.invalid) return;
    const email = this.registerForm.get('email')?.value as string;
    const name = this.registerForm.get('name')?.value as string;
    const code = this.registerForm.get('code')?.value as string;
    this.errorMsg.set(null);
    this.verifying.set(true);
    this.auth
      .verifyOtp(email, code, 'register', name)
      .then(() => {
        this.verifying.set(false);
        this.verified.set(true);
        // navigate based on redirect (guards will also handle)
        // Optionally we could router.navigate([res.redirect]) after session refresh occurs
        this.auth.decidePostAuthRedirect();
      })
      .catch((err) => {
        this.verifying.set(false);
        this.errorMsg.set(err.message || 'Invalid code');
      });
  }
}
