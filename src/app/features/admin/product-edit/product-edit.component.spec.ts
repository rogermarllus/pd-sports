import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  provideRouter,
  Router,
  RouterModule,
  ActivatedRoute,
  convertToParamMap,
} from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProductEditComponent } from './product-edit.component';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

const productServiceMock = {
  getById: vi.fn(),
  update: vi.fn(),
};

const authServiceMock = {
  logout: vi.fn(),
};

const mockProductData = {
  id: 42,
  name: 'Bola de Basquete',
  modality: 'Basquete',
  description: 'Bola oficial Wilson',
  price: 350.0,
  amount: 8,
  color: 'Laranja',
  variationType: 'Nenhuma',
};

describe('ProductEditComponent', () => {
  let component: ProductEditComponent;
  let fixture: ComponentFixture<ProductEditComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    productServiceMock.getById.mockReturnValue(of(mockProductData));
    productServiceMock.update.mockReturnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      declarations: [ProductEditComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [
        provideRouter([
          { path: 'admin/produtos', component: class DummyComponent {} },
          { path: 'auth/login', component: class DummyComponent {} },
        ]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '42' })),
          },
        },
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;
  });

  it('deve criar o componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Carga Inicial do Produto', () => {
    it('deve iniciar exibindo o estado de carregamento', () => {
      expect(component.isLoading).toBe(true);
    });

    it('deve buscar o produto pelo ID obtido na rota e preencher os controles', () => {
      fixture.detectChanges();

      expect(productServiceMock.getById).toHaveBeenCalledWith(42);
      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(false);
      expect(component.productForm.get('name')?.value).toBe('Bola de Basquete');
    });

    it('deve capturar falha no carregamento definindo sinalizador de erro', () => {
      productServiceMock.getById.mockReturnValue(throwError(() => new Error('404')));
      fixture.detectChanges();

      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(true);
    });
  });

  describe('Atualização (onSubmit)', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('não deve atualizar se o formulário for corrompido para inválido', () => {
      component.productForm.patchValue({ name: '' });
      component.onSubmit();

      expect(productServiceMock.update).not.toHaveBeenCalled();
    });

    it('deve invocar o update do ProductService enviando o ID e payload mapeado', () => {
      component.productForm.patchValue({ price: '370,50' });
      component.onSubmit();

      expect(productServiceMock.update).toHaveBeenCalledWith(42, {
        name: 'Bola de Basquete',
        modality: 'Basquete',
        description: 'Bola oficial Wilson',
        price: 370.5,
        amount: 8,
        color: 'Laranja',
        variationType: 'Nenhuma',
      });
    });

    it('deve redirecionar o administrador para a listagem geral após atualizar', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.onSubmit();

      expect(component.isSaving).toBe(false);
      expect(navigateSpy).toHaveBeenCalledWith(['/admin/produtos']);
    });

    it('deve interceptar falhas na atualização destravando o formulário', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});
      productServiceMock.update.mockReturnValue(throwError(() => new Error('Error')));

      component.onSubmit();

      expect(component.isSaving).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Erro ao atualizar o produto. Tente novamente.');
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
