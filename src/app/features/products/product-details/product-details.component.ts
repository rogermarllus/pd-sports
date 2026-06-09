import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

declare const lucide: any;

type VariationType = 'Numeração' | 'Letra' | 'Nenhuma' | null;

@Component({
  selector: 'app-product-details',
  standalone: false,
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  product: any = null;
  isLoading = true;
  hasError = false;
  errorMessage = '';

  variations: (string | number)[] = [];
  selectedVariation: string | number | null = null;

  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  private feedbackTimer: any;

  private readonly modalityMap: Record<string, string> = {
    'Artes Marciais': 'martialArts',
    Basquete: 'basketball',
    Caminhada: 'trekking',
    Ciclismo: 'cycling',
    Corrida: 'running',
    Crossfit: 'crossfit',
    Futebol: 'soccer',
    Futsal: 'futsal',
    Musculação: 'weightlifting',
    Natação: 'swimming',
    Skate: 'skateboarding',
    Surf: 'surfing',
    Tênis: 'tennis',
    Vôlei: 'volleyball',
    Yoga: 'yoga',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.showPageError('Produto não encontrado.');
        return;
      }
      this.loadProduct(Number(id));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.feedbackTimer);
  }

  // ── Carregamento ──────────────────────────────────────────────────────────

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.hasError = false;

    this.productService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          if (!product) {
            this.showPageError('Produto não encontrado no banco de dados.');
            return;
          }
          this.product = product;
          this.buildVariations(product.variationType);
          this.isLoading = false;
          this.cdRef.detectChanges();

          setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
          });
        },
        error: () => {
          this.showPageError('Erro de conexão ao carregar o produto.');
        },
      });
  }

  private showPageError(message: string): void {
    this.errorMessage = message;
    this.hasError = true;
    this.isLoading = false;
    this.cdRef.detectChanges();
  }

  private buildVariations(type: VariationType): void {
    if (!type || type === 'Nenhuma') {
      this.variations = [];
      this.selectedVariation = null;
      return;
    }

    if (type === 'Numeração') {
      this.variations = [36, 37, 38, 39, 40];
    } else if (type === 'Letra') {
      this.variations = ['PP', 'P', 'M', 'G', 'GG'];
    }

    this.selectedVariation = this.variations[0] ?? null;
  }

  selectVariation(variation: string | number): void {
    this.selectedVariation = variation;
  }

  get imagePath(): string {
    if (!this.product) return '/img/products/product-placeholder.avif';
    const modalityEN =
      this.modalityMap[this.product.modality] ?? this.product.modality?.toLowerCase() ?? '';
    return `/img/products/${modalityEN}/${this.product.imageName}.avif`;
  }

  get availability(): string {
    return Number(this.product?.amount) > 0 ? 'Disponível' : 'Indisponível';
  }

  get isAvailable(): boolean {
    return Number(this.product?.amount) > 0;
  }

  addToCart(): void {
    if (!this.isAvailable) {
      this.showFeedback('Produto indisponível no estoque.', 'error');
      return;
    }

    if (!this.authService.isLogged()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addItem({
      ...this.product,
      size: this.selectedVariation ?? null,
    });

    this.showFeedback('Produto adicionado ao carrinho!', 'success');
  }

  private showFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.feedbackMessage = '';
      this.feedbackType = '';
    }, 3000);
  }
}
