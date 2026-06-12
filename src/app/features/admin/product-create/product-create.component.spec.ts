import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProductCreateComponent } from './product-create.component';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

const productServiceMock = {
  create: vi.fn(),
};

const authServiceMock = {
  logout: vi.fn(),
};

describe('ProductCreateComponent', () => {
  let component: ProductCreateComponent;
  let fixture: ComponentFixture<ProductCreateComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    productServiceMock.create.mockReturnValue(of({ success: true, id: 99 }));

    await TestBed.configureTestingModule({
      declarations: [ProductCreateComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [
        provideRouter([
          { path: 'admin/produtos', component: class DummyComponent {} },
          { path: 'auth/login', component: class DummyComponent {} },
        ]),
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductCreateComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Formulário Reativo', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve inicializar com campos vazios e inválidos', () => {
      expect(component.productForm.valid).toBe(false);
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('amount')?.value).toBe(0);
    });

    it('deve invalidar o formulário se campos obrigatórios estiverem em branco', () => {
      component.productForm.patchValue({
        name: '',
        modality: '',
        description: '',
        price: '',
        variationType: '',
      });
      expect(component.productForm.valid).toBe(false);
    });

    it('deve invalidar se o preço for menor ou igual a zero', () => {
      component.productForm.patchValue({
        price: '0.00',
      });
      expect(component.productForm.get('price')?.hasError('min')).toBe(true);
    });

    it('deve invalidar se a quantidade for menor que zero', () => {
      component.productForm.patchValue({
        amount: -1,
      });
      expect(component.productForm.get('amount')?.hasError('min')).toBe(true);
    });

    it('deve validar o formulário com dados corretos', () => {
      component.productForm.patchValue({
        name: 'Camisa Polo',
        modality: 'Tennis',
        description: 'Camisa dry-fit',
        price: '129.90',
        amount: 10,
        color: 'Branca',
        variationType: 'Letra',
      });
      expect(component.productForm.valid).toBe(true);
    });
  });

  describe('Submissão (onSubmit)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.productForm.patchValue({
        name: 'Chuteira',
        modality: 'Futebol',
        description: 'Couro legítimo',
        price: '299,90',
        amount: 5,
        color: 'Preta',
        variationType: 'Numeração',
      });
    });

    it('não deve invocar o ProductService se o formulário for inválido', () => {
      component.productForm.patchValue({ name: '' });
      component.onSubmit();

      expect(productServiceMock.create).not.toHaveBeenCalled();
    });

    it('deve formatar o preço de string para number e chamar o create do ProductService', () => {
      component.onSubmit();

      expect(productServiceMock.create).toHaveBeenCalledWith({
        name: 'Chuteira',
        modality: 'Futebol',
        description: 'Couro legítimo',
        price: 299.9,
        amount: 5,
        color: 'Preta',
        variationType: 'Numeração',
        image: 'product-placeholder.avif',
      });
    });

    it('deve redirecionar para a listagem (/admin/produtos) após salvar com sucesso', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onSubmit();

      expect(component.isSaving).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/produtos']);
    });

    it('deve tratar erro da API de cadastro destravando o estado de salvamento', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      productServiceMock.create.mockReturnValue(throwError(() => new Error('Erro de Conexão')));

      component.onSubmit();

      expect(component.isSaving).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Erro ao cadastrar o produto. Tente novamente.');
    });
  });

  describe('Sessão', () => {
    it('deve invocar AuthService.logout e redirecionar para login ao deslogar', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onLogout();

      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
