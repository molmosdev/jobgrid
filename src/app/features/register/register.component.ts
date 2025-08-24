import { Component } from '@angular/core';
import { CompaniesService } from '../../core/services/companies.service';
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
  /**
   * Reactive form group for the company registration form.
   * Includes controls for name, domain, subdomain, profile image, and favicon.
   */
  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    domain: new FormControl('', Validators.required),
    subdomain: new FormControl('', Validators.required),
    profile_image: new FormControl<File | null>(null),
    favicon: new FormControl<File | null>(null)
  });

  /**
   * Holds error messages for file input validation for profile image and favicon.
   */
  fileErrors: Record<string, string> = {
    profile_image: '',
    favicon: ''
  };

  constructor(private companiesService: CompaniesService) {}

  /**
   * Returns a preview URL for a File object to be used in the template.
   *
   * @param file - The file to generate a preview URL for.
   * @returns The object URL string, or an empty string if file is null/undefined.
   */
  getFileUrl(file: File | null | undefined): string {
    if (!file) return '';
    return URL.createObjectURL(file);
  }

  /**
   * Handles file input changes, validates the file, and updates the form control.
   *
   * @param event - The file input change event.
   * @param type - The type of file being handled ('profile_image' or 'favicon').
   */
  onFileChange(event: Event, type: 'profile_image' | 'favicon'): void {
    const input = event.target as HTMLInputElement;
    this.fileErrors[type] = '';
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Validations
      if (type === 'profile_image') {
        const allowedTypes = ['image/png', 'image/jpeg'];
        const maxSize = 1 * 1024 * 1024; // 1MB
        if (!allowedTypes.includes(file.type)) {
          this.fileErrors[type] = 'Profile image must be PNG or JPG.';
          input.value = '';
          this.registerForm.get(type)?.setValue(null);
          return;
        }
        if (file.size > maxSize) {
          this.fileErrors[type] = 'Profile image cannot exceed 1MB.';
          input.value = '';
          this.registerForm.get(type)?.setValue(null);
          return;
        }
      }
      if (type === 'favicon') {
        const allowedTypes = ['image/x-icon', 'image/vnd.microsoft.icon'];
        const maxSize = 100 * 1024; // 100KB
        if (!allowedTypes.includes(file.type)) {
          this.fileErrors[type] = 'Favicon must be a .ico file.';
          input.value = '';
          this.registerForm.get(type)?.setValue(null);
          return;
        }
        if (file.size > maxSize) {
          this.fileErrors[type] = 'Favicon cannot exceed 100KB.';
          input.value = '';
          this.registerForm.get(type)?.setValue(null);
          return;
        }
      }
      this.registerForm.get(type)?.setValue(file);
    } else {
      this.registerForm.get(type)?.setValue(null);
    }
  }

  /**
   * Removes the selected file for the given type and resets the input.
   */
  /**
   * Removes the selected file for the given type and resets the input element.
   *
   * @param type - The type of file to remove ('profile_image' or 'favicon').
   * @param input - The file input element to reset.
   */
  removeFile(type: 'profile_image' | 'favicon', input: HTMLInputElement): void {
    this.registerForm.get(type)?.setValue(null);
    if (input) input.value = '';
  }

  /**
   * Handles form submission, validates the form, and sends the data to the backend.
   */
  onSubmit(): void {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) return;

    const formData = new FormData();
    Object.entries(this.registerForm.value).forEach(([key, value]) => {
      if (key === 'profile_image' || key === 'favicon') {
        if (value instanceof File) {
          formData.append(key, value);
        }
      } else if (value) {
        formData.append(key, value as string);
      }
    });

    this.companiesService.registerCompany(formData).subscribe({
      next: () => {
        // TODO: feedback or navigation
      },
      error: () => {
        // TODO: error feedback
      }
    });
  }
}
