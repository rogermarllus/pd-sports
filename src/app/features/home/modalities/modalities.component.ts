import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

type SortOrder = 'asc' | 'desc' | null;
type PriceRange = 'all' | '0-50' | '50-100' | '100-300' | '300-1000';

export interface PriceRangeOption {
  label: string;
  value: PriceRange;
}

export interface SortOption {
  label: string;
  value: SortOrder;
}

@Component({
  selector: 'app-modalities',
  standalone: false,
  templateUrl: './modalities.component.html',
  styleUrls: ['./modalities.component.css'],
})
export class ModalitiesComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  currentModality = '';
  isLoading = true;
  hasError = false;

  private allProducts: any[] = [];
  filteredProducts: any[] = [];
  popularProducts: any[] = [];

  currentRange: PriceRange = 'all';
  currentSort: SortOrder = null;

  readonly priceRangeOptions: PriceRangeOption[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Até R$ 50', value: '0-50' },
    { label: 'R$ 50 - 100', value: '50-100' },
    { label: 'R$ 100 - 300', value: '100-300' },
    { label: 'R$ 300+', value: '300-1000' },
  ];

  readonly sortOptions: SortOption[] = [
    { label: 'Menor preço', value: 'asc' },
    { label: 'Maior preço', value: 'desc' },
    { label: 'Limpar filtro', value: null },
  ];

  get priceLabel(): string {
    return this.priceRangeOptions.find((o) => o.value === this.currentRange)?.label ?? 'Preço';
  }

  get sortLabel(): string {
    if (!this.currentSort) return 'Ordenar';
    return this.sortOptions.find((o) => o.value === this.currentSort)?.label ?? 'Ordenar';
  }

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const modality = params.get('modality') ?? '';
      this.currentModality = modality;
      this.resetFilters();
      this.loadProducts(modality);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Carregamento ──────────────────────────────────────────────────────────

  private loadProducts(modality: string): void {
    if (!modality) {
      this.isLoading = false;
      this.hasError = false;
      this.filteredProducts = [];
      this.popularProducts = [];
      this.cdRef.detectChanges();
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.productService
      .getProductsByModality(modality)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: any[]) => {
          this.allProducts = products ?? [];
          this.applyFiltersAndSort();
          this.popularProducts = this.shuffle(this.allProducts).slice(0, 4);
          this.isLoading = false;
          this.cdRef.detectChanges();
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
          this.cdRef.detectChanges();
        },
      });
  }

  setRange(range: PriceRange): void {
    this.currentRange = range;
    this.applyFiltersAndSort();
  }

  setSort(sort: SortOrder): void {
    this.currentSort = sort;
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let result = this.filterByPrice(this.allProducts, this.currentRange);

    if (this.currentSort) {
      result = this.sortProducts(result, this.currentSort);
    }

    this.filteredProducts = result;
  }

  private filterByPrice(products: any[], range: PriceRange): any[] {
    if (range === 'all') return products;

    const [min, max] = range.split('-').map(Number);
    return products.filter((p) => {
      const price = Number(p.price);
      return max ? price >= min && price <= max : price >= min;
    });
  }

  private sortProducts(products: any[], order: 'asc' | 'desc'): any[] {
    return [...products].sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
  }

  private resetFilters(): void {
    this.currentRange = 'all';
    this.currentSort = null;
  }

  addToCart(product: any, event: Event): void {
    event.stopPropagation();

    if (Number(product.amount) <= 0) {
      alert('Produto indisponível');
      return;
    }

    if (!this.authService.isLogged()) {
      alert('Para executar esta ação, você precisa estar logado!');
      return;
    }

    this.cartService.addItem(product);
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
