import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export function confirmarSenhaValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const senha = group.get('senha')?.value;
    const confirmSenha = group.get('confirmSenha')?.value;
    return senha === confirmSenha ? null : { senhasDivergentes: true };
  };
}

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  apiError: string | null = null;
  termsAccepted = false;
  showTermsModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLogged()) {
      this.router.navigate(['/']);
      return;
    }

    this.form = this.fb.group(
      {
        nome: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        telefone: [
          '',
          [Validators.required, Validators.pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/)],
        ],
        dataNascimento: ['', [Validators.required]],
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confirmSenha: ['', [Validators.required]],
      },
      { validators: confirmarSenhaValidator() },
    );
  }

  get nomeCtrl() {
    return this.form.get('nome')!;
  }
  get emailCtrl() {
    return this.form.get('email')!;
  }
  get telefoneCtrl() {
    return this.form.get('telefone')!;
  }
  get dataNascimentoCtrl() {
    return this.form.get('dataNascimento')!;
  }
  get senhaCtrl() {
    return this.form.get('senha')!;
  }
  get confirmSenhaCtrl() {
    return this.form.get('confirmSenha')!;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  openTermsModal(): void {
    this.showTermsModal = true;
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || !this.termsAccepted) return;

    this.isLoading = true;
    this.apiError = null;

    const { nome, email, telefone, dataNascimento, senha } = this.form.value;

    this.authService
      .register({
        nome,
        email,
        telefone,
        dataNascimento,
        senha,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (err: Error) => {
          this.apiError = err.message ?? 'Erro ao realizar cadastro. Tente novamente.';
          this.isLoading = false;
        },
      });
  }
}
