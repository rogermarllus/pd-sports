import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModule } from '../auth.module';

const authServiceMock = {
  isLogged: vi.fn(),
  login: vi.fn(),
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    authServiceMock.isLogged.mockReturnValue(false);
    authServiceMock.login.mockReturnValue(of({ id: 1, email: 'user@test.com' }));

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

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('formulário reativo', () => {
    it('deve inicializar com campos vazios e inválidos', () => {
      expect(component.form.valid).toBe(false);
      expect(component.emailCtrl.value).toBe('');
      expect(component.senhaCtrl.value).toBe('');
    });

    it('deve invalidar e-mail com formato incorreto', () => {
      component.emailCtrl.setValue('nao-e-email');

      expect(component.emailCtrl.hasError('email')).toBe(true);
    });

    it('deve aceitar e-mail com formato correto', () => {
      component.emailCtrl.setValue('user@test.com');

      expect(component.emailCtrl.hasError('email')).toBe(false);
    });

    it('deve invalidar senha com menos de 6 caracteres', () => {
      component.senhaCtrl.setValue('123');

      expect(component.senhaCtrl.hasError('minlength')).toBe(true);
    });

    it('deve aceitar senha com 6 ou mais caracteres', () => {
      component.senhaCtrl.setValue('123456');

      expect(component.senhaCtrl.hasError('minlength')).toBe(false);
    });

    it('deve ser válido com e-mail e senha corretos', () => {
      component.emailCtrl.setValue('user@test.com');
      component.senhaCtrl.setValue('senha123');

      expect(component.form.valid).toBe(true);
    });
  });

  describe('exibição de erros por touched', () => {
    it('não deve marcar campos como touched no início', () => {
      expect(component.emailCtrl.touched).toBe(false);
      expect(component.senhaCtrl.touched).toBe(false);
    });

    it('deve marcar todos os campos como touched ao submeter formulário inválido', () => {
      component.onSubmit();

      expect(component.emailCtrl.touched).toBe(true);
      expect(component.senhaCtrl.touched).toBe(true);
    });

    it('não deve chamar AuthService.login se o formulário for inválido', () => {
      component.onSubmit();

      expect(authServiceMock.login).not.toHaveBeenCalled();
    });
  });

  describe('submissão', () => {
    beforeEach(() => {
      component.emailCtrl.setValue('user@test.com');
      component.senhaCtrl.setValue('senha123');
    });

    it('deve chamar AuthService.login com e-mail e senha', () => {
      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledWith('user@test.com', 'senha123');
    });

    it('deve redirecionar para "/" em caso de sucesso', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('deve exibir mensagem de erro e não redirecionar em caso de falha da API', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error('Email ou senha inválidos')),
      );

      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onSubmit();

      expect(component.apiError).toBe('Email ou senha inválidos');
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('deve limpar apiError a cada nova tentativa de submit', () => {
      component.apiError = 'erro anterior';

      authServiceMock.login.mockReturnValue(of({ id: 1 }));

      component.onSubmit();

      expect(component.apiError).toBeNull();
    });

    it('deve desativar isLoading após erro da API', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => new Error('Email ou senha inválidos')),
      );

      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('redirect guard', () => {
    it('deve redirecionar para "/" se usuário já estiver autenticado', () => {
      authServiceMock.isLogged.mockReturnValue(true);

      const navigateSpy = vi.spyOn(router, 'navigate');

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });

    it('não deve construir o formulário se usuário já estiver autenticado', () => {
      authServiceMock.isLogged.mockReturnValue(true);

      fixture = TestBed.createComponent(LoginComponent);
      component = fixture.componentInstance;

      component.ngOnInit();

      expect(component.form).toBeUndefined();
    });
  });

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
});
