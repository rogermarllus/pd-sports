import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

const productServiceMock = {
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const authServiceMock = {
  logout: vi.fn(),
};

const mockProducts = [
  {
    id: 1,
    name: 'Bola',
    modality: 'Futebol',
    description: 'Descrição',
    price: 100,
    amount: 10,
    color: 'Branca',
    variationType: 'Nenhuma',
    image: 'bola.jpg',
  },
  {
    id: 2,
    name: 'Tênis',
    modality: 'Corrida',
    description: 'Descrição',
    price: 200,
    amount: 0,
    color: 'Preto',
    variationType: 'Numeração',
    image: 'tenis.jpg',
  },
];

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    productServiceMock.getAll.mockReturnValue(of(mockProducts));
    productServiceMock.create.mockReturnValue(of({}));
    productServiceMock.update.mockReturnValue(of({}));
    productServiceMock.delete.mockReturnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
      imports: [ReactiveFormsModule, RouterModule],
      providers: [
        provideRouter([]),
        { provide: ProductService, useValue: productServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;

    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('deve criar o componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Inicialização e carregamento', () => {
    it('deve iniciar carregando', () => {
      expect(component.isLoading).toBe(true);
    });

    it('deve carregar produtos no ngOnInit', () => {
      fixture.detectChanges();

      expect(productServiceMock.getAll).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      expect(component.hasError).toBe(false);
      expect(component.filteredProducts.length).toBe(2);
    });

    it('deve tratar erro ao carregar produtos', () => {
      productServiceMock.getAll.mockReturnValue(throwError(() => new Error('Erro')));

      fixture.detectChanges();

      expect(component.hasError).toBe(true);
      expect(component.isLoading).toBe(false);
    });

    it('deve ordenar produtos alfabeticamente', () => {
      fixture.detectChanges();

      expect(component.filteredProducts[0].name).toBe('Bola');
      expect(component.filteredProducts[1].name).toBe('Tênis');
    });
  });

  describe('Busca e filtros', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve filtrar produtos pelo nome', () => {
      component.searchTerm = 'bola';
      (component as any).applyFilter();

      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].name).toBe('Bola');
    });

    it('deve ignorar acentos na busca', () => {
      component.searchTerm = 'tenis';
      (component as any).applyFilter();

      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].name).toBe('Tênis');
    });

    it('deve restaurar lista completa quando busca estiver vazia', () => {
      component.searchTerm = '';
      (component as any).applyFilter();

      expect(component.filteredProducts.length).toBe(2);
    });
  });

  describe('Paginação', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve iniciar na página 1', () => {
      expect(component.currentPage).toBe(1);
    });

    it('deve alterar página corretamente', () => {
      component.goToPage(2);

      expect(component.currentPage).toBe(2);
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('não deve alterar página ao receber reticências', () => {
      component.goToPage('...');

      expect(component.currentPage).toBe(1);
    });

    it('deve identificar reticências corretamente', () => {
      expect(component.isEllipsis('...')).toBe(true);
      expect(component.isEllipsis(1)).toBe(false);
    });
  });

  describe('Modal de criação e edição', () => {
    beforeEach(() => {
      fixture.detectChanges();
      vi.spyOn(component, 'isMobile').mockReturnValue(false);
    });

    it('deve abrir modal de criação', () => {
      component.openCreateModal();

      expect(component.formModalOpen).toBe(true);
      expect(component.editingProduct).toBeNull();
    });

    it('deve abrir modal de edição', () => {
      component.handleEdit(mockProducts[0]);

      expect(component.formModalOpen).toBe(true);
      expect(component.editingProduct).toEqual(mockProducts[0]);
    });

    it('deve fechar modal corretamente', () => {
      component.openCreateModal();

      component.closeFormModal();

      expect(component.formModalOpen).toBe(false);
      expect(component.editingProduct).toBeNull();
    });

    it('deve navegar para edição em dispositivos móveis', () => {
      vi.spyOn(component, 'isMobile').mockReturnValue(true);

      const navigateSpy = vi.spyOn(router, 'navigate');

      component.handleEdit(mockProducts[0]);

      expect(navigateSpy).toHaveBeenCalledWith(['/admin/produtos/editar', 1]);
    });
  });

  describe('Salvar produto', () => {
    beforeEach(() => {
      fixture.detectChanges();

      component.productForm.patchValue({
        name: 'Produto',
        modality: 'Futebol',
        description: 'Teste',
        price: '10.50',
        amount: 5,
        color: 'Azul',
        variationType: 'Nenhuma',
      });
    });

    it('não deve salvar formulário inválido', () => {
      component.productForm.patchValue({
        name: '',
      });

      component.saveProduct();

      expect(productServiceMock.create).not.toHaveBeenCalled();
    });

    it('deve criar produto', () => {
      component.saveProduct();

      expect(productServiceMock.create).toHaveBeenCalled();
    });

    it('deve atualizar produto existente', () => {
      component.editingProduct = mockProducts[0];

      component.saveProduct();

      expect(productServiceMock.update).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('deve tratar erro ao criar produto', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      productServiceMock.create.mockReturnValue(throwError(() => new Error()));

      component.saveProduct();

      expect(component.isSaving).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('Exclusão de produto', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('deve abrir modal de exclusão', () => {
      component.requestDelete(mockProducts[0]);

      expect(component.deleteModalOpen).toBe(true);
      expect(component.pendingDeleteProduct).toEqual(mockProducts[0]);
    });

    it('deve cancelar exclusão', () => {
      component.requestDelete(mockProducts[0]);

      component.cancelDelete();

      expect(component.deleteModalOpen).toBe(false);
      expect(component.pendingDeleteProduct).toBeNull();
    });

    it('deve excluir produto', () => {
      component.requestDelete(mockProducts[0]);

      component.confirmDelete();

      expect(productServiceMock.delete).toHaveBeenCalledWith(1);
      expect(component.filteredProducts.length).toBe(1);
    });

    it('não deve excluir sem produto selecionado', () => {
      component.confirmDelete();

      expect(productServiceMock.delete).not.toHaveBeenCalled();
    });

    it('deve tratar erro ao excluir', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {});

      productServiceMock.delete.mockReturnValue(throwError(() => new Error()));

      component.requestDelete(mockProducts[0]);
      component.confirmDelete();

      expect(component.isDeleting).toBe(false);
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('Utilitários', () => {
    it('deve identificar produto disponível', () => {
      expect(component.isAvailable(mockProducts[0])).toBe(true);
    });

    it('deve identificar produto indisponível', () => {
      expect(component.isAvailable(mockProducts[1])).toBe(false);
    });
  });

  describe('Logout', () => {
    it('deve realizar logout e navegar para login', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onLogout();

      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
