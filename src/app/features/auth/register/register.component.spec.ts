import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModule } from '../auth.module';

const authServiceMock = {
  isLogged: vi.fn(),
  register: vi.fn(),
};

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    authServiceMock.isLogged.mockReturnValue(false);
    authServiceMock.register.mockReturnValue(of({ id: 1, email: 'user@test.com' }));

    await TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  // ──────────────────────────────────────────
  // Formulário reativo
  // ──────────────────────────────────────────

  describe('formulário reativo', () => {
    it('deve inicializar com todos os campos vazios e inválidos', () => {
      expect(component.form.valid).toBe(false);
      expect(component.nomeCtrl.value).toBe('');
      expect(component.emailCtrl.value).toBe('');
      expect(component.telefoneCtrl.value).toBe('');
      expect(component.dataNascimentoCtrl.value).toBe('');
      expect(component.senhaCtrl.value).toBe('');
      expect(component.confirmSenhaCtrl.value).toBe('');
    });

    it('deve invalidar nome com menos de 3 caracteres', () => {
      component.nomeCtrl.setValue('AB');
      expect(component.nomeCtrl.hasError('minlength')).toBe(true);
    });

    it('deve aceitar nome com 3 ou mais caracteres', () => {
      component.nomeCtrl.setValue('Ana');
      expect(component.nomeCtrl.hasError('minlength')).toBe(false);
    });

    it('deve invalidar e-mail com formato incorreto', () => {
      component.emailCtrl.setValue('nao-e-email');
      expect(component.emailCtrl.hasError('email')).toBe(true);
    });

    it('deve aceitar e-mail com formato correto', () => {
      component.emailCtrl.setValue('user@test.com');
      expect(component.emailCtrl.hasError('email')).toBe(false);
    });

    it('deve invalidar telefone com formato incorreto', () => {
      component.telefoneCtrl.setValue('12345');
      expect(component.telefoneCtrl.hasError('pattern')).toBe(true);
    });

    it('deve aceitar telefone com formato correto', () => {
      component.telefoneCtrl.setValue('(11) 91234-5678');
      expect(component.telefoneCtrl.hasError('pattern')).toBe(false);
    });

    it('deve invalidar senha com menos de 6 caracteres', () => {
      component.senhaCtrl.setValue('123');
      expect(component.senhaCtrl.hasError('minlength')).toBe(true);
    });

    it('deve aceitar senha com 6 ou mais caracteres', () => {
      component.senhaCtrl.setValue('123456');
      expect(component.senhaCtrl.hasError('minlength')).toBe(false);
    });

    it('deve indicar erro de senhas divergentes quando confirmSenha difere de senha', () => {
      component.senhaCtrl.setValue('senha123');
      component.confirmSenhaCtrl.setValue('diferente');
      expect(component.form.hasError('senhasDivergentes')).toBe(true);
    });

    it('não deve indicar erro de senhas divergentes quando confirmSenha é igual a senha', () => {
      component.senhaCtrl.setValue('senha123');
      component.confirmSenhaCtrl.setValue('senha123');
      expect(component.form.hasError('senhasDivergentes')).toBe(false);
    });

    it('deve ser válido com todos os campos preenchidos corretamente', () => {
      component.nomeCtrl.setValue('João Silva');
      component.emailCtrl.setValue('user@test.com');
      component.telefoneCtrl.setValue('(11) 91234-5678');
      component.dataNascimentoCtrl.setValue('2000-01-01');
      component.senhaCtrl.setValue('senha123');
      component.confirmSenhaCtrl.setValue('senha123');

      expect(component.form.valid).toBe(true);
    });
  });

  // ──────────────────────────────────────────
  // Exibição de erros por touched
  // ──────────────────────────────────────────

  describe('exibição de erros por touched', () => {
    it('não deve marcar campos como touched no início', () => {
      expect(component.nomeCtrl.touched).toBe(false);
      expect(component.emailCtrl.touched).toBe(false);
      expect(component.senhaCtrl.touched).toBe(false);
    });

    it('deve marcar todos os campos como touched ao submeter formulário inválido', () => {
      component.onSubmit();

      expect(component.nomeCtrl.touched).toBe(true);
      expect(component.emailCtrl.touched).toBe(true);
      expect(component.telefoneCtrl.touched).toBe(true);
      expect(component.dataNascimentoCtrl.touched).toBe(true);
      expect(component.senhaCtrl.touched).toBe(true);
      expect(component.confirmSenhaCtrl.touched).toBe(true);
    });

    it('não deve chamar AuthService.register se o formulário for inválido', () => {
      component.onSubmit();
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('não deve chamar AuthService.register se os termos não forem aceitos', () => {
      component.nomeCtrl.setValue('João Silva');
      component.emailCtrl.setValue('user@test.com');
      component.telefoneCtrl.setValue('(11) 91234-5678');
      component.dataNascimentoCtrl.setValue('2000-01-01');
      component.senhaCtrl.setValue('senha123');
      component.confirmSenhaCtrl.setValue('senha123');
      component.termsAccepted = false;

      component.onSubmit();

      expect(authServiceMock.register).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────
  // Submissão
  // ──────────────────────────────────────────

  describe('submissão', () => {
    beforeEach(() => {
      component.nomeCtrl.setValue('João Silva');
      component.emailCtrl.setValue('user@test.com');
      component.telefoneCtrl.setValue('(11) 91234-5678');
      component.dataNascimentoCtrl.setValue('2000-01-01');
      component.senhaCtrl.setValue('senha123');
      component.confirmSenhaCtrl.setValue('senha123');
      component.termsAccepted = true;
    });

    it('deve chamar AuthService.register com os dados corretos', () => {
      component.onSubmit();

      expect(authServiceMock.register).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'user@test.com',
        telefone: '(11) 91234-5678',
        dataNascimento: '2000-01-01',
        senha: 'senha123',
      });
    });

    it('deve redirecionar para "/auth/login" em caso de sucesso', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });

    it('deve exibir mensagem de erro e não redirecionar em caso de falha da API', () => {
      authServiceMock.register.mockReturnValue(throwError(() => new Error('E-mail já cadastrado')));

      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(component.apiError).toBe('E-mail já cadastrado');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('deve limpar apiError a cada nova tentativa de submit', () => {
      component.apiError = 'erro anterior';

      authServiceMock.register.mockReturnValue(of({ id: 1 }));

      component.onSubmit();

      expect(component.apiError).toBeNull();
    });

    it('deve desativar isLoading após erro da API', () => {
      authServiceMock.register.mockReturnValue(throwError(() => new Error('E-mail já cadastrado')));

      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });
  });

  // ──────────────────────────────────────────
  // Redirect guard
  // ──────────────────────────────────────────

  describe('redirect guard', () => {
    it('deve redirecionar para "/" se usuário já estiver autenticado', () => {
      authServiceMock.isLogged.mockReturnValue(true);

      const navigateSpy = vi.spyOn(router, 'navigate');

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('não deve construir o formulário se usuário já estiver autenticado', () => {
      authServiceMock.isLogged.mockReturnValue(true);

      fixture = TestBed.createComponent(RegisterComponent);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(component.form).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────
  // Toggle de senha
  // ──────────────────────────────────────────

  describe('togglePasswordVisibility', () => {
    it('deve iniciar com senha oculta', () => {
      expect(component.showPassword).toBe(false);
    });

    it('deve alternar showPassword a cada chamada', () => {
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(true);

      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(false);
    });
  });

  describe('toggleConfirmPasswordVisibility', () => {
    it('deve iniciar com confirmação de senha oculta', () => {
      expect(component.showConfirmPassword).toBe(false);
    });

    it('deve alternar showConfirmPassword a cada chamada', () => {
      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword).toBe(true);

      component.toggleConfirmPasswordVisibility();
      expect(component.showConfirmPassword).toBe(false);
    });
  });

  // ──────────────────────────────────────────
  // Modal de Termos de Uso
  // ──────────────────────────────────────────

  describe('modal de termos de uso', () => {
    it('deve iniciar com modal fechado', () => {
      expect(component.showTermsModal).toBe(false);
    });

    it('deve abrir o modal ao chamar openTermsModal', () => {
      component.openTermsModal();
      expect(component.showTermsModal).toBe(true);
    });

    it('deve fechar o modal ao chamar closeTermsModal', () => {
      component.showTermsModal = true;
      component.closeTermsModal();
      expect(component.showTermsModal).toBe(false);
    });
  });
});
