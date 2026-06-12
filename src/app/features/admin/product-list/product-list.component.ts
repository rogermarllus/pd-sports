import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

const ITEMS_PER_PAGE = 9;

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  allProducts: any[] = [];
  filteredProducts: any[] = [];
  isLoading = true;
  hasError = false;

  searchTerm = '';
  currentPage = 1;

  deleteModalOpen = false;
  pendingDeleteProduct: any = null;
  isDeleting = false;

  formModalOpen = false;
  editingProduct: any = null;
  productForm!: FormGroup;
  isSaving = false;

  readonly modalitiesList = [
    'Futebol',
    'Basquete',
    'Futsal',
    'Vôlei',
    'Corrida',
    'Musculação',
    'Crossfit',
    'Ciclismo',
    'Natação',
    'Tênis',
    'Artes Marciais',
    'Skate',
    'Surf',
    'Yoga',
    'Caminhada',
  ];

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      modality: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0.01)]],
      amount: [0, [Validators.required, Validators.min(0)]],
      color: [''],
      variationType: ['', Validators.required],
    });
  }

  get totalItems(): number {
    return this.filteredProducts.length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / ITEMS_PER_PAGE);
  }

  get pagedProducts(): any[] {
    const start = (this.currentPage - 1) * ITEMS_PER_PAGE;
    return this.filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }

  get pageRange(): (number | '...')[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const WINDOW = 2;
    const pages: (number | '...')[] = [1];

    if (current - WINDOW > 2) pages.push('...');

    for (let p = Math.max(2, current - WINDOW); p <= Math.min(total - 1, current + WINDOW); p++) {
      pages.push(p);
    }

    if (current + WINDOW < total - 1) pages.push('...');
    pages.push(total);

    return pages;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.hasError = false;

    this.productService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.allProducts = this.sortAlphabetically(products);
          this.applyFilter();
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

  private sortAlphabetically(products: any[]): any[] {
    return [...products].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
    );
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.allProducts];
    } else {
      const term = this.normalize(this.searchTerm);
      this.filteredProducts = this.allProducts.filter((p) => this.normalize(p.name).includes(term));
    }
    this.currentPage = 1;
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  goToPage(page: number | '...'): void {
    if (page === '...' || page === this.currentPage) return;
    this.currentPage = page as number;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleEdit(product: any): void {
    if (this.isMobile()) {
      this.router.navigate(['/admin/produtos/editar', product.id]);
    } else {
      this.editingProduct = product;
      this.productForm.patchValue(product);
      this.formModalOpen = true;
    }
  }

  openCreateModal(): void {
    if (this.isMobile()) {
      this.router.navigate(['/admin/produtos/novo']);
    } else {
      this.editingProduct = null;
      this.productForm.reset({ amount: 0, variationType: '', modality: '' });
      this.formModalOpen = true;
    }
  }

  closeFormModal(): void {
    this.formModalOpen = false;
    this.editingProduct = null;
    this.isSaving = false;
    this.cdRef.detectChanges();
  }

  saveProduct(): void {
    if (this.productForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const rawPayload = this.productForm.getRawValue();

    const priceFormatted =
      typeof rawPayload.price === 'string'
        ? parseFloat(rawPayload.price.replace(',', '.'))
        : rawPayload.price;

    const productPayload = {
      ...rawPayload,
      price: priceFormatted,
      image: this.editingProduct?.image || 'product-placeholder.avif',
    };

    if (this.editingProduct) {
      this.productService
        .update(this.editingProduct.id, productPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeFormModal();
            this.loadProducts();
            this.cdRef.detectChanges();
          },
          error: () => {
            this.isSaving = false;
            this.cdRef.detectChanges();
            alert('Erro ao atualizar produto. Tente novamente.');
          },
        });
    } else {
      this.productService
        .create(productPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeFormModal();
            this.loadProducts();
            this.cdRef.detectChanges();
          },
          error: () => {
            this.isSaving = false;
            this.cdRef.detectChanges();
            alert('Erro ao cadastrar produto. Tente novamente.');
          },
        });
    }
  }

  requestDelete(product: any): void {
    this.pendingDeleteProduct = product;
    this.deleteModalOpen = true;
  }

  cancelDelete(): void {
    this.deleteModalOpen = false;
    this.pendingDeleteProduct = null;
    this.cdRef.detectChanges();
  }

  confirmDelete(): void {
    if (!this.pendingDeleteProduct) return;

    this.isDeleting = true;

    this.productService
      .delete(this.pendingDeleteProduct.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.allProducts = this.allProducts.filter(
            (p) => String(p.id) !== String(this.pendingDeleteProduct.id),
          );
          this.applyFilter();

          if (this.currentPage > this.totalPages) {
            this.currentPage = Math.max(1, this.totalPages);
          }

          this.isDeleting = false;
          this.cancelDelete();
          this.cdRef.detectChanges();
        },
        error: () => {
          this.isDeleting = false;
          this.cdRef.detectChanges();
          alert('Não foi possível excluir o produto. Tente novamente.');
        },
      });
  }

  isAvailable(product: any): boolean {
    return Number(product.amount) > 0;
  }

  isMobile(): boolean {
    return window.innerWidth < 768;
  }

  isEllipsis(page: number | '...'): boolean {
    return page === '...';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
