import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../../core/services/cart.service';
import { FreightService } from '../../../core/services/freight.service';
import { AuthService } from '../../../core/services/auth.service';

declare const lucide: any;

export type PaymentMethod = 'pix' | 'credit' | 'boleto';

export interface ShippingOption {
  name: string;
  price: number;
  delivery_time?: number | string;
}

@Component({
  selector: 'app-cart-page',
  standalone: false,
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css'],
})
export class CartPageComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly destroy$ = new Subject<void>();

  items: any[] = [];

  cep = '';
  shippingOptions: ShippingOption[] = [];
  selectedShipping: ShippingOption | null = null;
  isCalculatingFreight = false;
  freightError = '';

  modalOpen = false;
  currentStep: 1 | 2 | 3 = 1;
  chosenMethod: PaymentMethod = 'pix';
  orderNumber = '';

  cardNum = '';
  cardHolder = '';
  cardExp = '';
  cardCvv = '';

  pixCopied = false;
  boletoCopied = false;

  readonly METHOD_TITLES: Record<PaymentMethod, string> = {
    pix: 'Pagamento via PIX',
    credit: 'Cartão de Crédito',
    boleto: 'Boleto Bancário',
  };

  constructor(
    public cartService: CartService,
    private freightService: FreightService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cartService.items$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.items = items;
      this.cdr.markForCheck();
      // Reinicializa ícones do Lucide após mudanças no carrinho
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  ngAfterViewInit(): void {
    lucide.createIcons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get subtotal(): number {
    return this.cartService.getTotal();
  }

  get totalQuantity(): number {
    return this.items.reduce((acc, i) => acc + i.quantity, 0);
  }

  get shippingPrice(): number {
    return this.selectedShipping?.price ?? 0;
  }

  get total(): number {
    return this.subtotal + this.shippingPrice;
  }

  getImagePath(item: any): string {
    const map: Record<string, string> = {
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
    const mod = map[item.modality] ?? item.modality?.toLowerCase() ?? 'geral';
    return `/img/products/${mod}/${item.imageName}.avif`;
  }

  increment(id: number): void {
    this.cartService.incrementItem(id);
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  decrement(id: number): void {
    this.cartService.decrementItem(id);
    this.selectedShipping = null;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  remove(id: number): void {
    this.cartService.removeItem(id);
    this.selectedShipping = null;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let n = input.value.replace(/\D/g, '').substring(0, 8);
    this.cep = n.length > 5 ? `${n.slice(0, 5)}-${n.slice(5)}` : n;
    input.value = this.cep;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  calcularFrete(): void {
    const clean = this.cep.replace(/\D/g, '');

    if (clean.length !== 8) {
      this.freightError = 'Informe um CEP válido com 8 dígitos.';
      return;
    }

    this.isCalculatingFreight = true;
    this.freightError = '';
    this.shippingOptions = [];
    this.selectedShipping = null;

    this.cdr.markForCheck();

    this.freightService
      .calculateFreight(clean)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options: any[]) => {
          const sorted = [...options]
            .sort((a, b) => Number(a.price) - Number(b.price))
            .slice(0, 3)
            .map((o) => ({ name: o.name, price: Number(o.price), delivery_time: o.delivery_time }));

          this.shippingOptions = sorted;
          this.selectedShipping = sorted[0] ?? null;
          this.isCalculatingFreight = false;
          this.cdr.markForCheck();
          if (typeof lucide !== 'undefined') lucide.createIcons();
        },
        error: (err: Error) => {
          this.freightError = err.message ?? 'Erro ao calcular o frete. Tente novamente.';
          this.isCalculatingFreight = false;
          this.cdr.markForCheck();
        },
      });
  }

  selectShipping(option: ShippingOption): void {
    this.selectedShipping = option;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  openModal(): void {
    if (!this.authService.isLogged()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.items.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    this.currentStep = 1;
    this.chosenMethod = 'pix';
    this.cardNum = '';
    this.cardHolder = '';
    this.cardExp = '';
    this.cardCvv = '';
    this.modalOpen = true;
    document.body.style.overflow = 'hidden';
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  closeModal(): void {
    this.modalOpen = false;
    document.body.style.overflow = '';
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  goToStep(step: 1 | 2 | 3): void {
    this.currentStep = step;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  selectMethod(method: PaymentMethod): void {
    this.chosenMethod = method;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  confirmPayment(): void {
    if (this.chosenMethod === 'credit') {
      const numClean = this.cardNum.replace(/\s/g, '');
      if (
        numClean.length < 16 ||
        !this.cardHolder.trim() ||
        this.cardExp.length < 5 ||
        this.cardCvv.length < 3
      ) {
        alert('Preencha todos os dados do cartão corretamente.');
        return;
      }
    }

    this.orderNumber = 'PD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    this.goToStep(3);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  finishShopping(): void {
    this.cartService.clearCart();
    this.closeModal();
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    this.router.navigate(['/']);
  }

  onCardNumInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 16);
    this.cardNum = v.replace(/(.{4})/g, '$1 ').trim();
    input.value = this.cardNum;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  onCardExpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 4);
    this.cardExp = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
    input.value = this.cardExp;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  copyPix(): void {
    navigator.clipboard.writeText('pdsports@pagamentos.com.br').catch(() => {});
    this.pixCopied = true;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
      this.pixCopied = false;
      this.cdr.markForCheck();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 2000);
  }

  copyBoleto(): void {
    navigator.clipboard
      .writeText('34191.09008 00004.585609 71234.560007 3 10110000095700')
      .catch(() => {});
    this.boletoCopied = true;
    this.cdr.markForCheck();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    setTimeout(() => {
      this.boletoCopied = false;
      this.cdr.markForCheck();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 2000);
  }

  formatBRL(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
