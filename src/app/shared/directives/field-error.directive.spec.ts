import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { SharedModule } from '../shared.module';
import { FieldErrorDirective } from './field-error.directive';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule],
  template: `
    <form [formGroup]="form">
      <div class="container-input">
        <input formControlName="email" appFieldError [control]="emailControl" />
      </div>
    </form>
  `,
})
class TestHostComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }
}

describe('FieldErrorDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.debugElement.query(By.directive(FieldErrorDirective))).toBeTruthy();
  });

  it('should not show error when untouched', () => {
    const span = fixture.nativeElement.querySelector('.fv-error');
    expect(span?.innerHTML.trim()).toBe('');
  });

  it('should show required error when touched and empty', () => {
    fixture.componentInstance.emailControl.markAsTouched();
    fixture.componentInstance.emailControl.updateValueAndValidity();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.fv-error')?.textContent).toContain(
      'Preencha o campo obrigatório',
    );
  });

  it('should show email error when format is invalid', () => {
    fixture.componentInstance.emailControl.setValue('invalido');
    fixture.componentInstance.emailControl.markAsTouched();
    fixture.componentInstance.emailControl.updateValueAndValidity();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.fv-error')?.textContent).toContain(
      'Informe um e-mail válido',
    );
  });

  it('should add fv-invalid class when invalid and touched', () => {
    fixture.componentInstance.emailControl.markAsTouched();
    fixture.componentInstance.emailControl.updateValueAndValidity();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input').classList).toContain('fv-invalid');
  });

  it('should add fv-valid class when valid and touched', () => {
    fixture.componentInstance.emailControl.setValue('ok@email.com');
    fixture.componentInstance.emailControl.markAsTouched();
    fixture.componentInstance.emailControl.updateValueAndValidity();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input').classList).toContain('fv-valid');
  });

  it('should clear error when field becomes valid', () => {
    fixture.componentInstance.emailControl.markAsTouched();
    fixture.componentInstance.emailControl.updateValueAndValidity();

    fixture.detectChanges();

    fixture.componentInstance.emailControl.setValue('ok@email.com');
    fixture.componentInstance.emailControl.updateValueAndValidity();

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.fv-error')?.innerHTML.trim()).toBe('');
  });
});
