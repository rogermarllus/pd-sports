import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { SearchResultComponent } from './search-result.component';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-product-card',
  template: '',
  standalone: false,
})
class MockProductCardComponent {
  @Input() produto: any;
}

const mockProducts = [
  {
    id: 1,
    name: 'Chuteira Adidas X',
    modality: 'Futebol',
    description: 'Chuteira profissional',
    price: 299.9,
  },
  {
    id: 2,
    name: 'Bola UEFA Champions',
    modality: 'Futebol',
    description: 'Bola oficial',
    price: 199.9,
  },
  {
    id: 3,
    name: 'Tênis Crossfit Dual',
    modality: 'Crossfit',
    description: 'Confortável e leve',
    price: 449.9,
  },
  {
    id: 4,
    name: 'Camisa Polo Skate',
    modality: 'Skate',
    description: 'Estilo clássico',
    price: 129.9,
  },
  {
    id: 5,
    name: 'Óculos Natação Pro',
    modality: 'Natação',
    description: 'Alta vedação',
    price: 89.9,
  },
];

function makeQueryParamMap(query: string | null) {
  return of({ get: (_: string) => query });
}

describe('SearchResultComponent', () => {
  let component: SearchResultComponent;
  let fixture: ComponentFixture<SearchResultComponent>;
  let productServiceSpy: { getAll: ReturnType<typeof vi.fn> };
  let querySubject: Subject<any>;

  beforeAll(() => {
    (globalThis as any).lucide = { createIcons: () => {} };
  });

  beforeEach(async () => {
    querySubject = new Subject();

    productServiceSpy = {
      getAll: vi.fn().mockReturnValue(of(mockProducts)),
    };

    await TestBed.configureTestingModule({
      declarations: [SearchResultComponent, MockProductCardComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: querySubject.asObservable() },
        },
        { provide: ProductService, useValue: productServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with empty searchTerm', () => {
    expect(component.searchTerm).toBe('');
  });

  it('should start with empty results', () => {
    expect(component.results).toEqual([]);
  });

  it('should start with isLoading false', () => {
    expect(component.isLoading).toBe(false);
  });

  it('should start with hasError false', () => {
    expect(component.hasError).toBe(false);
  });

  it('should keep results empty when query param is null', async () => {
    querySubject.next({ get: (_: string) => null });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.results).toEqual([]);
    expect(productServiceSpy.getAll).not.toHaveBeenCalled();
  });

  it('should keep results empty when query param is empty string', async () => {
    querySubject.next({ get: (_: string) => '  ' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.results).toEqual([]);
    expect(productServiceSpy.getAll).not.toHaveBeenCalled();
  });

  it('should call productService.getAll when query param is provided', async () => {
    querySubject.next({ get: (_: string) => 'futebol' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(productServiceSpy.getAll).toHaveBeenCalled();
  });

  it('should populate results for a matching query', async () => {
    querySubject.next({ get: (_: string) => 'futebol' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results.length).toBeGreaterThan(0);
  });

  it('should set searchTerm from query param', async () => {
    querySubject.next({ get: (_: string) => 'tênis' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.searchTerm).toBe('tênis');
  });

  it('should set isLoading to false after successful search', async () => {
    querySubject.next({ get: (_: string) => 'bola' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
  });

  it('should set hasError to false after successful search', async () => {
    querySubject.next({ get: (_: string) => 'chuteira' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.hasError).toBe(false);
  });

  it('should return results sorted by score descending', async () => {
    querySubject.next({ get: (_: string) => 'chuteira' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results[0].id).toBe(1);
  });

  it('should match on product name (score +3)', async () => {
    querySubject.next({ get: (_: string) => 'óculos' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results.some((p) => p.id === 5)).toBe(true);
  });

  it('should match on modality (score +2)', async () => {
    querySubject.next({ get: (_: string) => 'natacao' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results.some((p) => p.modality === 'Natação')).toBe(true);
  });

  it('should match on description (score +1)', async () => {
    querySubject.next({ get: (_: string) => 'vedação' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results.some((p) => p.id === 5)).toBe(true);
  });

  it('should normalize accents in search term', async () => {
    querySubject.next({ get: (_: string) => 'tenis' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results.some((p) => p.id === 3)).toBe(true);
  });

  it('should return empty results when no product matches', async () => {
    querySubject.next({ get: (_: string) => 'xyzxyzxyz' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results).toEqual([]);
  });

  it('should set hasError to true when service throws', async () => {
    productServiceSpy.getAll.mockReturnValue(throwError(() => new Error('API error')));

    querySubject.next({ get: (_: string) => 'futebol' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.hasError).toBe(true);
    expect(component.isLoading).toBe(false);
  });

  it('should keep results empty on error', async () => {
    productServiceSpy.getAll.mockReturnValue(throwError(() => new Error('API error')));

    querySubject.next({ get: (_: string) => 'futebol' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results).toEqual([]);
  });

  it('should re-search when query param changes', async () => {
    querySubject.next({ get: (_: string) => 'futebol' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const firstCount = component.results.length;

    fixture.detectChanges();
    querySubject.next({ get: (_: string) => 'skate' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.searchTerm).toBe('skate');
    expect(component.results.length).not.toEqual(firstCount);
  });

  it('should clear results when query changes to null', async () => {
    querySubject.next({ get: (_: string) => 'futebol' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.detectChanges();
    querySubject.next({ get: (_: string) => null });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.results).toEqual([]);
  });
});
