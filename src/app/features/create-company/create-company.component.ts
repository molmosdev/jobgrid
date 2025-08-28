import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CompaniesService } from '../../core/services/companies.service';
import {
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  CardFooterComponent,
  InputComponent
} from '@basis-ng/primitives';
import { AuthService } from '../../core/services/auth.service';
import { SessionService } from '../../core/services/session.service';
import { Router } from '@angular/router';

/** Create company form (handles validation, previews, submission). */
@Component({
  selector: 'app-create-company',
  imports: [
    InputComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    CardFooterComponent,
    ReactiveFormsModule
  ],
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.css'
})
export default class CreateCompanyComponent implements OnInit, OnDestroy {
  // ---- File validation constants ----
  private static readonly LOGO_ALLOWED_TYPES = ['image/png', 'image/jpeg'];
  private static readonly LOGO_MAX_SIZE = 1 * 1024 * 1024; // 1MB
  private static readonly FAVICON_ALLOWED_TYPES = ['image/x-icon', 'image/vnd.microsoft.icon'];
  private static readonly FAVICON_MAX_SIZE = 100 * 1024; // 100KB

  /** Reactive form (logo + favicon optional). */
  companyForm = new FormGroup({
    name: new FormControl('', Validators.required),
    domain: new FormControl('', Validators.required),
    subdomain: new FormControl('', Validators.required),
    logo: new FormControl<File | null>(null),
    favicon: new FormControl<File | null>(null)
  });

  /** File validation errors keyed by control. */
  fileErrors: Record<string, string> = {
    logo: '',
    favicon: ''
  };

  /** Object URL for logo preview (revoked/cleared when replaced or destroyed). */
  logoPreviewUrl = '';

  /** Object URL for favicon preview (revoked/cleared when replaced or destroyed). */
  faviconPreviewUrl = '';

  /** Companies API abstraction. */
  private readonly companiesService = inject(CompaniesService);

  /** Auth service (user email for domain prefill). */
  protected readonly authService = inject(AuthService);

  /** Session state (optimistic hasCompany flip + refresh). */
  private readonly sessionService = inject(SessionService);

  /** Router for post-success navigation. */
  private readonly router = inject(Router);

  /** True while submission in progress. */
  readonly submitting = signal(false);

  /** True after successful submission (before redirect). */
  readonly success = signal(false);

  /** Submission/server error message. */
  readonly errorMsg = signal<string | null>(null);

  /** Ensures domain autofill runs once. */
  private domainInitialized = false;
  /** Redirect timeout id (cleared on destroy). */
  private redirectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const u = this.authService.user();
    if (u && !this.domainInitialized) {
      const email = u.email || '';
      const parts = email.split('@');
      if (parts.length === 2) {
        const domainPart = parts[1];
        const domainCtrl = this.companyForm.get('domain');
        if (domainCtrl) {
          domainCtrl.setValue(domainPart);
          domainCtrl.disable({ emitEvent: false });
          this.domainInitialized = true;
        }
      }
    }
  }

  /**
   * Handle file selection.
   * @param event - change event.
   * @param type - 'logo' or 'favicon'.
   */
  onFileChange(event: Event, type: 'logo' | 'favicon'): void {
    const input = event.target as HTMLInputElement;
    this.fileErrors[type] = '';
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validations
      if (type === 'logo') {
        if (!CreateCompanyComponent.LOGO_ALLOWED_TYPES.includes(file.type))
          return this.invalidateFile(type, input, 'Profile image must be PNG or JPG.');
        if (file.size > CreateCompanyComponent.LOGO_MAX_SIZE)
          return this.invalidateFile(type, input, 'Profile image cannot exceed 1MB.');
      } else if (type === 'favicon') {
        if (!CreateCompanyComponent.FAVICON_ALLOWED_TYPES.includes(file.type))
          return this.invalidateFile(type, input, 'Favicon must be a .ico file.');
        if (file.size > CreateCompanyComponent.FAVICON_MAX_SIZE)
          return this.invalidateFile(type, input, 'Favicon cannot exceed 100KB.');
      }
      this.companyForm.get(type)?.setValue(file);
      this.updatePreview(type, file);
    } else {
      this.companyForm.get(type)?.setValue(null);
      this.updatePreview(type, null);
    }
  }

  /**
   * Remove selected file.
   * @param type - 'logo' or 'favicon'.
   * @param input - native input to reset.
   */
  removeFile(type: 'logo' | 'favicon', input: HTMLInputElement): void {
    this.companyForm.get(type)?.setValue(null);
    if (input) input.value = '';
    this.updatePreview(type, null);
  }

  /** Create / revoke preview URLs to avoid leaks. */
  private updatePreview(type: 'logo' | 'favicon', file: File | null): void {
    // Revoke previous URL to avoid memory leaks
    if (type === 'logo' && this.logoPreviewUrl) URL.revokeObjectURL(this.logoPreviewUrl);
    if (type === 'favicon' && this.faviconPreviewUrl) URL.revokeObjectURL(this.faviconPreviewUrl);
    if (!file) {
      if (type === 'logo') this.logoPreviewUrl = '';
      else this.faviconPreviewUrl = '';
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === 'logo') this.logoPreviewUrl = url;
    else this.faviconPreviewUrl = url;
  }

  ngOnDestroy(): void {
    if (this.logoPreviewUrl) URL.revokeObjectURL(this.logoPreviewUrl);
    if (this.faviconPreviewUrl) URL.revokeObjectURL(this.faviconPreviewUrl);
    if (this.redirectTimeoutId) clearTimeout(this.redirectTimeoutId);
  }

  /** Submit form (build FormData, call API, handle optimistic state + redirect). */
  onSubmit(): void {
    this.companyForm.markAllAsTouched();
    if (this.companyForm.invalid) return;

    const formData = new FormData();
    // Use getRawValue so disabled domain is included
    const raw = this.companyForm.getRawValue() as {
      name: string;
      domain: string;
      subdomain: string;
      logo: File | null;
      favicon: File | null;
    };
    Object.entries(raw).forEach(([key, value]) => {
      if (key === 'logo' || key === 'favicon') {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else if (value) {
        formData.append(key, value as string);
      }
    });

    this.submitting.set(true);
    this.errorMsg.set(null);
    this.companiesService.registerCompany(formData).subscribe({
      next: async () => {
        this.submitting.set(false);
        this.success.set(true);
        // Optimistically flip hasCompany so guards/routes behave instantly
        try {
          this.sessionService.hasCompany.set(true);
        } catch {
          // ignore if signal not writable
        }
        // Refresh session in background to sync server state (company ownership)
        this.sessionService.refresh();
        // Give user a moment to see success message
        this.redirectTimeoutId = setTimeout(() => this.router.navigate(['/']), 1200);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.error || 'Failed to create company');
      }
    });
  }

  /** Reset invalid file selection with error message. */
  private invalidateFile(type: 'logo' | 'favicon', input: HTMLInputElement, message: string): void {
    this.fileErrors[type] = message;
    input.value = '';
    this.companyForm.get(type)?.setValue(null);
    this.updatePreview(type, null);
  }
}
