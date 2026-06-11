import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UserDetailsComponent } from './user-details.component';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

const userServiceMock = {
  getUser: vi.fn(),
  updateUser: vi.fn(),
};

const authServiceMock = {
  logout: vi.fn(),
};

const mockUserData = {
  name: 'John Doe',
  phone: '11999999999',
  email: 'john@test.com',
  birthDate: '1990-01-01',
  prefEmail: true,
  prefWhatsappOfertas: false,
  prefWhatsappPedidos: true,
};

describe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;
  let router: Router;

  beforeAll(() => {
    // Mock global para a biblioteca Lucide utilizada no componente
    (globalThis as any).lucide = {
      createIcons: vi.fn(),
    };
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    // Comportamento padrão dos mocks
    userServiceMock.getUser.mockReturnValue(of(mockUserData));
    userServiceMock.updateUser.mockReturnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      declarations: [UserDetailsComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── Ciclo de Inicialização e Carregamento ─────────────────────────────────

  describe('Inicialização e Carga de Dados', () => {
    it('deve iniciar com estado de carregamento ativo', () => {
      expect(component.isLoading).toBe(true);
    });

    it('deve carregar os dados do usuário e preencher o formulário no OnInit', () => {
      fixture.detectChanges(); // Executa o ngOnInit

      expect(userServiceMock.getUser).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      expect(component.form.getRawValue()).toEqual(mockUserData);
    });

    it('deve tratar falha no carregamento dos dados da API', () => {
      userServiceMock.getUser.mockReturnValue(throwError(() => new Error('Erro de API')));

      fixture.detectChanges();

      expect(component.hasError).toBe(true);
      expect(component.isLoading).toBe(false);
    });

    it('deve gerar a data máxima de nascimento corretamente', () => {
      fixture.detectChanges();
      expect(component.maxBirthDate).toBeDefined();
      expect(component.maxBirthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ── Comportamento do Formulário e Edição ──────────────────────────────────

  describe('Formulário e Modos de Edição', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve iniciar com todos os campos do formulário desativados (disabled)', () => {
      expect(component.form.disabled).toBe(true);
      expect(component.isEditing).toBe(false);
    });

    it('deve ativar os campos do formulário ao chamar enableEdit()', () => {
      component.enableEdit();

      expect(component.form.enabled).toBe(true);
      expect(component.isEditing).toBe(true);
    });

    it('deve invalidar o formulário se o e-mail for limpo ou mal formatado', () => {
      component.enableEdit();
      component.form.patchValue({ email: 'email-invalido' });
      expect(component.form.valid).toBe(false);

      component.form.patchValue({ email: '' });
      expect(component.form.valid).toBe(false);
    });
  });

  // ── Ações de Persistência (Salvar Dados) ──────────────────────────────────

  describe('Submissão e Atualização de Dados', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.enableEdit();
    });

    it('não deve chamar o UserService se o formulário estiver inválido', () => {
      component.form.patchValue({ name: '' }); // Nome é obrigatório
      component.saveUser();

      expect(userServiceMock.updateUser).not.toHaveBeenCalled();
    });

    it('deve chamar o UserService com os dados corretos ao salvar', () => {
      component.saveUser();

      expect(userServiceMock.updateUser).toHaveBeenCalledWith(mockUserData);
    });

    it('deve desativar o formulário e abrir modal de sucesso após atualização bem-sucedida', () => {
      component.saveUser();

      expect(component.isSaving).toBe(false);
      expect(component.form.disabled).toBe(true);
      expect(component.isEditing).toBe(false);
      expect(component.modalOpen).toBe(true);
      expect(component.modalTitle).toBe('Dados atualizados!');
    });

    it('deve tratar erro ao salvar exibindo modal de falha sem bloquear formulário', () => {
      userServiceMock.updateUser.mockReturnValue(throwError(() => new Error('Erro ao salvar')));

      component.saveUser();

      expect(component.isSaving).toBe(false);
      expect(component.form.enabled).toBe(true);
      expect(component.modalOpen).toBe(true);
      expect(component.modalTitle).toBe('Erro ao salvar');
    });
  });

  // ── Fluxo dos Modais ──────────────────────────────────────────────────────

  describe('Gerenciamento de Modais', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve configurar as variáveis e abrir o modal de detalhes do pedido indisponível', () => {
      component.openOrderModal();

      expect(component.modalOpen).toBe(true);
      expect(component.modalTitle).toBe('Detalhes do pedido');
      expect(component.modalMessage).toContain('Infelizmente não conseguimos');
    });

    it('deve fechar o modal corretamente ao chamar closeModal()', () => {
      component.openOrderModal();
      component.closeModal();

      expect(component.modalOpen).toBe(false);
    });

    it('deve recarregar os dados do usuário se reloadAfterClose for verdadeiro ao fechar o modal', () => {
      // Força cenário de recarregamento pós-sucesso
      component.enableEdit();
      component.saveUser();

      userServiceMock.getUser.mockClear(); // Limpa chamadas anteriores do init
      component.closeModal();

      expect(userServiceMock.getUser).toHaveBeenCalled();
    });
  });

  // ── Sessão e Autenticação ────────────────────────────────────────────────

  describe('Autenticação e Logout', () => {
    it('deve invocar o AuthService e redirecionar para a tela de login', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.logout();

      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
