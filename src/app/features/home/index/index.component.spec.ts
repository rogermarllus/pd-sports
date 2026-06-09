import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { IndexComponent } from './index.component';
import { ProductService } from '../../../core/services/product.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl-pipe';

@Component({
  selector: 'app-product-card',
  template: '',
  standalone: false,
})
class MockProductCardComponent {
  @Input() produto: any;
  @Input() destaque = false;
}

const mockProducts = [
  { id: 7, name: 'Produto 7', price: 100 },
  { id: 34, name: 'Produto 34', price: 200 },
  { id: 128, name: 'Produto 128', price: 300 },
  { id: 132, name: 'Produto 132', price: 400 },
  { id: 96, name: 'Produto 96', price: 500 },
  { id: 23, name: 'Produto 23', price: 600 },
  { id: 86, name: 'Produto 86', price: 700 },
  { id: 88, name: 'Produto 88', price: 800 },
];

describe('IndexComponent', () => {
  let component: IndexComponent;
  let fixture: ComponentFixture<IndexComponent>;

  beforeAll(() => {
    (globalThis as any).lucide = {
      createIcons: () => {},
    };
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndexComponent, MockProductCardComponent, CurrencyBrlPipe],
      imports: [RouterModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: {
            getById: (id: number) => of(mockProducts.find((p) => p.id === id) ?? null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(IndexComponent);
    component = fixture.componentInstance;

    (component as any).updateCarouselButtons = () => {};
    component.ngAfterViewInit = () => {};

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ────────────────────────────────────────────────────────

  it('should start with isLoadingProducts as true before ngOnInit', () => {
    const freshFixture = TestBed.createComponent(IndexComponent);

    freshFixture.componentInstance.ngAfterViewInit = () => {};
    (freshFixture.componentInstance as any).updateCarouselButtons = () => {};

    expect(freshFixture.componentInstance.isLoadingProducts).toBe(true);
  });

  it('should set isLoadingProducts to false after loading', async () => {
    fixture.detectChanges();

    await Promise.resolve();
    await fixture.whenStable();

    fixture.detectChanges();

    expect(component.isLoadingProducts).toBe(false);
  });

  it('should load featured products after init', async () => {
    fixture.detectChanges();

    await Promise.resolve();
    await fixture.whenStable();

    fixture.detectChanges();

    expect(component.featuredProducts.length).toBeGreaterThan(0);
  });

  // ── Dados estáticos ───────────────────────────────────────────────────────

  it('should have 15 modalities', () => {
    expect(component.modalities.length).toBe(15);
  });

  it('every modality should have label, route and image', () => {
    component.modalities.forEach((m) => {
      expect(m.label).toBeTruthy();
      expect(m.route).toBeTruthy();
      expect(m.image).toBeTruthy();
    });
  });

  it('should have 4 best offers', () => {
    expect(component.bestOffers.length).toBe(4);
  });

  it('every best offer should have title, price, id and cssClass', () => {
    component.bestOffers.forEach((o) => {
      expect(o.title).toBeTruthy();
      expect(o.price).toBeTruthy();
      expect(o.id).toBeTruthy();
      expect(o.cssClass).toBeTruthy();
    });
  });

  // ── bestOffersDesktop ─────────────────────────────────────────────────────

  it('bestOffersDesktop should return pairs of offers', () => {
    const pairs = component.bestOffersDesktop;

    expect(pairs.length).toBe(2);

    pairs.forEach((pair) => {
      expect(pair.first).toBeDefined();
    });
  });

  it('bestOffersDesktop first pair should match first two best offers', () => {
    const pairs = component.bestOffersDesktop;

    expect(pairs[0].first).toEqual(component.bestOffers[0]);
    expect(pairs[0].second).toEqual(component.bestOffers[1]);
  });

  // ── Carrossel de modalidades — estado dos botões ──────────────────────────

  it('should start with prevDisabled true', () => {
    expect(component.prevDisabled).toBe(true);
  });

  it('should start with nextDisabled false', () => {
    expect(component.nextDisabled).toBe(false);
  });
});
