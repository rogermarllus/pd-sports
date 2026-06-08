import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

declare const lucide: any;

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() produto: any;
  @Input() destaque = false;

  @Output() cardClicado = new EventEmitter<any>();

  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngAfterViewInit() {
    lucide.createIcons();
  }

  get imagePath(): string {
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
    const modalityEN = map[this.produto?.modality] || this.produto?.modality?.toLowerCase() || '';
    return `/img/products/${modalityEN}/${this.produto?.imageName}.avif`;
  }

  navigateToDetails(): void {
    this.cardClicado.emit(this.produto);
    this.router.navigate(['/products', this.produto.id]);
  }

  addToCart(event: Event): void {
    event.stopPropagation();

    if (Number(this.produto.amount) <= 0) {
      alert('Produto indisponível');
      return;
    }

    if (!this.authService.isLogged()) {
      alert('Para executar esta ação, você precisa estar logado!');
      return;
    }

    this.cartService.addItem(this.produto);
  }
}
