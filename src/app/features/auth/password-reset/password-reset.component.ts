import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-reset',
  standalone: false,
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css'],
})
export class PasswordResetComponent implements OnInit {
  form!: FormGroup;
  isLoading = signal(false);
  showModal = signal(false);

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      recaptcha: [false, Validators.requiredTrue],
    });
  }

  get emailCtrl() {
    return this.form.get('email')!;
  }

  get recaptchaCtrl() {
    return this.form.get('recaptcha')!;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      this.showModal.set(true);
    }, 1000);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.form.reset({ email: '', recaptcha: false });
  }
}
