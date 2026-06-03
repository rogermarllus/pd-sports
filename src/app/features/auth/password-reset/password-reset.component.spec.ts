import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { PasswordResetComponent } from './password-reset.component';
import { AuthModule } from '../auth.module';

describe('PasswordResetComponent', () => {
  let component: PasswordResetComponent;
  let fixture: ComponentFixture<PasswordResetComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordResetComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('formulário reativo', () => {
    it('deve inicializar com os campos vazios/falsos e inválidos', () => {
      expect(component.form.valid).toBe(false);
      expect(component.emailCtrl.value).toBe('');
      expect(component.recaptchaCtrl.value).toBe(false);
    });

    it('deve invalidar se o recaptcha não for marcado', () => {
      component.emailCtrl.setValue('user@test.com');
      component.recaptchaCtrl.setValue(false);

      expect(component.form.valid).toBe(false);
      expect(component.recaptchaCtrl.hasError('required')).toBe(true);
    });

    it('deve validar se e-mail estiver correto e recaptcha marcado', () => {
      component.emailCtrl.setValue('user@test.com');
      component.recaptchaCtrl.setValue(true);

      expect(component.form.valid).toBe(true);
    });
  });

  describe('submissão do formulário', () => {
    it('deve marcar os campos como touched ao submeter formulário inválido', () => {
      component.onSubmit();

      expect(component.emailCtrl.touched).toBe(true);
      expect(component.recaptchaCtrl.touched).toBe(true);
      expect(component.isLoading()).toBe(false);
    });

    it('deve ativar o loading e exibir o modal após simular o envio de sucesso', () => {
      vi.useFakeTimers();

      component.emailCtrl.setValue('user@test.com');
      component.recaptchaCtrl.setValue(true);
      component.onSubmit();

      expect(component.isLoading()).toBe(true);

      vi.advanceTimersByTime(1000);

      expect(component.isLoading()).toBe(false);
      expect(component.showModal()).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('controle do modal', () => {
    it('deve ocultar o modal e resetar os campos do formulário ao chamar closeModal()', () => {
      component.showModal.set(true);
      component.emailCtrl.setValue('user@test.com');
      component.recaptchaCtrl.setValue(true);

      component.closeModal();

      expect(component.showModal()).toBe(false);
      expect(component.emailCtrl.value).toBe('');
      expect(component.recaptchaCtrl.value).toBe(false);
    });
  });
});
