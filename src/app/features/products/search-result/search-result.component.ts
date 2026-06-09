import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-search-result',
  standalone: false,
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css'],
})
export class SearchResultComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  searchTerm = '';
  results: any[] = [];
  isLoading = false;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const query = params.get('query')?.trim() ?? '';
      this.searchTerm = query;

      if (query) {
        this.search(query);
      } else {
        this.results = [];
        this.hasError = false;
        this.isLoading = false;
        this.cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private search(term: string): void {
    this.isLoading = true;
    this.hasError = false;
    this.results = [];

    this.cdRef.markForCheck();

    this.productService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.results = this.rankProducts(products, term);
          this.isLoading = false;
          this.cdRef.markForCheck();
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
          this.results = [];
          this.cdRef.markForCheck();
        },
      });
  }

  private rankProducts(products: any[], term: string): any[] {
    const normalized = this.normalize(term);

    return products
      .map((product) => {
        let score = 0;

        if (this.normalize(product.name ?? '').includes(normalized)) score += 3;
        if (this.normalize(product.modality ?? '').includes(normalized)) score += 2;
        if (this.normalize(product.description ?? '').includes(normalized)) score += 1;

        return { ...product, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
