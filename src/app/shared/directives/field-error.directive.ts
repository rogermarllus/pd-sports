import { Directive, Input, OnInit, OnDestroy, ElementRef, Renderer2, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

const ERROR_ICON = `<svg class="fv-icon-alert" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

// Ordem de prioridade dos erros
const ERROR_PRIORITY: { key: string; message: (err: any) => string }[] = [
  { key: 'required', message: () => 'Preencha o campo obrigatório' },
  { key: 'email', message: () => 'Informe um e-mail válido' },
  { key: 'minlength', message: (err) => `Mínimo de ${err.requiredLength} caracteres` },
  { key: 'pattern', message: () => 'Formato inválido' },
];

@Directive({
  selector: '[appFieldError]',
  standalone: false,
})
export class FieldErrorDirective implements OnInit, OnDestroy {
  @Input() control!: AbstractControl;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  private errorSpan: HTMLElement | null = null;
  private subscription: Subscription | null = null;

  ngOnInit(): void {
    if (!this.control) return;

    this.errorSpan = this.renderer.createElement('span');
    this.renderer.addClass(this.errorSpan, 'error');
    this.renderer.addClass(this.errorSpan, 'fv-error');

    const container =
      this.el.nativeElement.closest('.container-input') ??
      this.renderer.parentNode(this.el.nativeElement);

    this.renderer.appendChild(container, this.errorSpan);

    this.subscription = this.control.statusChanges?.subscribe(() => this.update()) ?? null;

    this.renderer.listen(this.el.nativeElement, 'blur', () => {
      this.control.markAsTouched();
      this.update();
    });

    this.update();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (this.errorSpan) {
      const parent = this.renderer.parentNode(this.errorSpan);
      if (parent) this.renderer.removeChild(parent, this.errorSpan);
    }
  }

  private update(): void {
    if (!this.control || !this.errorSpan) return;

    const input = this.el.nativeElement;
    const container = input.closest('.container-input') || this.renderer.parentNode(input);

    const isInvalid = this.control.invalid && this.control.touched;
    const isValid = this.control.valid && this.control.touched;

    this.renderer.removeClass(input, 'fv-valid');
    this.renderer.removeClass(input, 'fv-invalid');
    this.renderer.removeClass(container, 'fv-valid');
    this.renderer.removeClass(container, 'fv-invalid');

    if (isValid) {
      this.renderer.addClass(input, 'fv-valid');
      this.renderer.addClass(container, 'fv-valid');
      this.errorSpan.innerHTML = '';
      return;
    }

    if (isInvalid) {
      this.renderer.addClass(input, 'fv-invalid');
      this.renderer.addClass(container, 'fv-invalid');
      this.errorSpan.innerHTML = `${ERROR_ICON} ${this.getErrorMessage()}`;
      return;
    }

    this.errorSpan.innerHTML = '';
  }

  // Retorna a primeira mensagem de erro respeitando a ordem de prioridade
  private getErrorMessage(): string {
    const errors = this.control.errors;
    if (!errors) return '';

    for (const { key, message } of ERROR_PRIORITY) {
      if (errors[key] !== undefined) return message(errors[key]);
    }

    // Fallback para erros customizados não mapeados
    const firstKey = Object.keys(errors)[0];
    return errors[firstKey]?.message ?? 'Campo inválido';
  }
}
