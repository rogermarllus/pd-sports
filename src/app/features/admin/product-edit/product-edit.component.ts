import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-edit',
  standalone: false,
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.css'],
})
export class ProductEditComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  productForm!: FormGroup;
  productId!: string;
  isLoading = true;
  isSaving = false;
  hasError = false;

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
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.productId = params.get('id') ?? '';
      if (this.productId) {
        this.fetchProduct();
      }
    });
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

  private fetchProduct(): void {
    this.isLoading = true;
    this.hasError = false;

    this.productService
      .getById(Number(this.productId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          if (product) {
            this.productForm.patchValue(product);
          }
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

  onSubmit(): void {
    if (this.productForm.invalid || this.isSaving) return;

    this.isSaving = true;
    const rawPayload = this.productForm.getRawValue();

    const priceFormatted =
      typeof rawPayload.price === 'string'
        ? parseFloat(rawPayload.price.replace(',', '.'))
        : rawPayload.price;

    const payload = {
      ...rawPayload,
      price: priceFormatted,
    };

    this.productService
      .update(Number(this.productId), payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.cdRef.detectChanges();
          this.router.navigate(['/admin/produtos']);
        },
        error: () => {
          this.isSaving = false;
          this.cdRef.detectChanges();
          alert('Erro ao atualizar o produto. Tente novamente.');
        },
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
