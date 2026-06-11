import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

declare const lucide: any;

@Component({
  selector: 'app-user-details',
  standalone: false,
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  form!: FormGroup;
  isEditing = false;

  isLoading = true;
  isSaving = false;
  hasError = false;

  modalOpen = false;
  modalTitle = '';
  modalMessage = '';
  modalSubMessage = '';
  private reloadAfterClose = false;

  readonly maxBirthDate: string = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  readonly mockOrders = [
    { numero: '3527843933323', data: '12/12/2025', quantidade: 1, valor: 'R$ 239,80' },
    { numero: '34934572034323', data: '01/10/2026', quantidade: 1, valor: 'R$ 287,99' },
  ];

  readonly modalityColumns = [
    ['Futebol', 'Basquete', 'Futsal', 'Vôlei', 'Corrida'],
    ['Musculação', 'Crossfit', 'Ciclismo', 'Natação', 'Tênis'],
    ['Artes Marciais', 'Skate', 'Surf', 'Yoga', 'Caminhada'],
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [{ value: '', disabled: true }, Validators.required],
      phone: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      birthDate: [{ value: '', disabled: true }],
      prefEmail: [{ value: false, disabled: true }],
      prefWhatsappOfertas: [{ value: false, disabled: true }],
      prefWhatsappPedidos: [{ value: true, disabled: true }],
    });
  }

  private loadUser(): void {
    this.isLoading = true;

    this.userService
      .getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.form.patchValue(user);
          this.isLoading = false;
          setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
          });
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        },
      });
  }

  enableEdit(): void {
    this.form.enable();
    this.isEditing = true;
  }

  saveUser(): void {
    if (this.form.invalid) return;

    this.isSaving = true;

    this.userService
      .updateUser(this.form.getRawValue())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.form.disable();
          this.isEditing = false;
          this.reloadAfterClose = true;
          this.openModal(
            'Dados atualizados!',
            'Seus dados foram salvos com sucesso.',
            'As informações já estão atualizadas na sua conta.',
          );
        },
        error: () => {
          this.isSaving = false;
          this.openModal(
            'Erro ao salvar',
            'Não foi possível atualizar seus dados.',
            'Tente novamente mais tarde.',
          );
        },
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  openModal(title: string, message: string, subMessage: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalSubMessage = subMessage;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    if (this.reloadAfterClose) {
      this.reloadAfterClose = false;
      this.loadUser();
    }
  }

  openOrderModal(): void {
    this.openModal(
      'Detalhes do pedido',
      'Infelizmente não conseguimos retornar os dados desse pedido no momento.',
      'Tente novamente mais tarde ou entre em contato com o nosso suporte.',
    );
  }
}
