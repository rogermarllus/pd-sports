import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;
  isLoading = false;
  apiError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Redireciona usuário já autenticado
    if (this.authService.isLogged()) {
      this.router.navigate(['/']);
      return;
    }

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get emailCtrl() {
    return this.form.get('email')!;
  }

  get senhaCtrl() {
    return this.form.get('senha')!;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Marca todos os campos como tocados para exibir erros de campos vazios
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.isLoading = true;
    this.apiError = null;

    const { email, senha } = this.form.value;

    this.authService.login(email, senha).subscribe({
      next: () => {
        // CA17.4 — em caso de sucesso, redireciona para '/'
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        // CA17.4 — em caso de erro da API, exibe mensagem sem redirecionar
        this.apiError = err.message ?? 'Erro ao realizar login. Tente novamente.';
        this.isLoading = false;
      },
    });
  }
}
