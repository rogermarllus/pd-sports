import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ModalitiesComponent } from './modalities.component';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-card',
  template: '',
  standalone: false,
})
class MockProductCardComponent {
  @Input() produto: any;
}

const mockProducts = [
  { id: 1, name: 'Bola Futebol A', price: 99.9, amount: 5 },
  { id: 2, name: 'Bola Futebol B', price: 199.9, amount: 3 },
  { id: 3, name: 'Chuteira X', price: 349.9, amount: 0 },
  { id: 4, name: 'Meião Pro', price: 49.9, amount: 10 },
  { id: 5, name: 'Luva Goleiro', price: 249.9, amount: 2 },
];

const paramMapSubject = new Subject<any>();

describe('ModalitiesComponent', () => {
  let component: ModalitiesComponent;
  let fixture: ComponentFixture<ModalitiesComponent>;
  let productServiceSpy: { getProductsByModality: ReturnType<typeof vi.fn> };
  let cartServiceSpy: { addItem: ReturnType<typeof vi.fn> };
  let authServiceSpy: { isLogged: ReturnType<typeof vi.fn> };

  beforeAll(() => {
    (globalThis as any).lucide = {
      createIcons: () => {},
    };
  });

  beforeEach(async () => {
    productServiceSpy = {
      getProductsByModality: vi.fn().mockReturnValue(of(mockProducts)),
    };

    cartServiceSpy = {
      addItem: vi.fn(),
    };

    authServiceSpy = {
      isLogged: vi.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      declarations: [ModalitiesComponent, MockProductCardComponent],
      imports: [RouterModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (_: string) => 'Futebol' }),
          },
        },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalitiesComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ────────────────────────────────────────────────────────

  it('should start with isLoading true before ngOnInit', () => {
    const freshFixture = TestBed.createComponent(ModalitiesComponent);
    expect(freshFixture.componentInstance.isLoading).toBe(true);
  });

  it('should set isLoading to false after products are loaded', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
  });

  it('should set hasError to false on successful load', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.hasError).toBe(false);
  });

  // ── Carregamento de produtos ──────────────────────────────────────────────

  it('should load products from the route modality param', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(productServiceSpy.getProductsByModality).toHaveBeenCalledWith('Futebol');
  });

  it('should populate filteredProducts after loading', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.filteredProducts.length).toBeGreaterThan(0);
  });

  it('should populate popularProducts with at most 4 items', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.popularProducts.length).toBeLessThanOrEqual(4);
    expect(component.popularProducts.length).toBeGreaterThan(0);
  });

  it('should set currentModality from route param', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.currentModality).toBe('Futebol');
  });

  it('should set hasError to true when service throws', async () => {
    productServiceSpy.getProductsByModality.mockReturnValue(
      new (await import('rxjs')).Observable((sub) => sub.error('erro')),
    );

    const errFixture = TestBed.createComponent(ModalitiesComponent);
    errFixture.detectChanges();
    await errFixture.whenStable();

    expect(errFixture.componentInstance.hasError).toBe(true);
    expect(errFixture.componentInstance.isLoading).toBe(false);
  });

  // ── Filtros de preço ──────────────────────────────────────────────────────

  it('should have 5 price range options', () => {
    expect(component.priceRangeOptions.length).toBe(5);
  });

  it('should start with currentRange as "all"', () => {
    expect(component.currentRange).toBe('all');
  });

  it('priceLabel should return "Todos" when range is "all"', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.priceLabel).toBe('Todos');
  });

  it('setRange should update currentRange and refilter products', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setRange('100-300');

    expect(component.currentRange).toBe('100-300');
    component.filteredProducts.forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(100);
      expect(p.price).toBeLessThanOrEqual(300);
    });
  });

  it('setRange("all") should return all products', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setRange('0-50');
    component.setRange('all');

    expect(component.filteredProducts.length).toBe(mockProducts.length);
  });

  it('setRange should return empty when no products match the range', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setRange('0-50');

    expect(component.filteredProducts.length).toBe(
      mockProducts.filter((p) => p.price >= 0 && p.price <= 50).length,
    );
  });

  // ── Ordenação ─────────────────────────────────────────────────────────────

  it('should have 3 sort options', () => {
    expect(component.sortOptions.length).toBe(3);
  });

  it('should start with currentSort as null', () => {
    expect(component.currentSort).toBeNull();
  });

  it('sortLabel should return "Ordenar" when currentSort is null', () => {
    expect(component.sortLabel).toBe('Ordenar');
  });

  it('setSort("asc") should order products from cheapest to most expensive', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setSort('asc');

    const prices = component.filteredProducts.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('setSort("desc") should order products from most expensive to cheapest', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setSort('desc');

    const prices = component.filteredProducts.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('setSort(null) should remove ordering', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setSort('asc');
    component.setSort(null);

    expect(component.currentSort).toBeNull();
    expect(component.sortLabel).toBe('Ordenar');
  });

  it('sortLabel should reflect current sort option label', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.setSort('asc');
    expect(component.sortLabel).toBe('Menor preço');

    component.setSort('desc');
    expect(component.sortLabel).toBe('Maior preço');
  });

  // ── Carrinho ──────────────────────────────────────────────────────────────

  it('addToCart should call cartService.addItem when user is logged and product has stock', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const product = mockProducts[0];
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.addToCart(product, event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(cartServiceSpy.addItem).toHaveBeenCalledWith(product);
  });

  it('addToCart should not call cartService.addItem when user is not logged', async () => {
    authServiceSpy.isLogged.mockReturnValue(false);

    fixture.detectChanges();
    await fixture.whenStable();

    const product = mockProducts[0];
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.addToCart(product, event);

    expect(cartServiceSpy.addItem).not.toHaveBeenCalled();
  });

  it('addToCart should not call cartService.addItem when product is out of stock', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const outOfStock = mockProducts.find((p) => p.amount === 0)!;
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.addToCart(outOfStock, event);

    expect(cartServiceSpy.addItem).not.toHaveBeenCalled();
  });
});
