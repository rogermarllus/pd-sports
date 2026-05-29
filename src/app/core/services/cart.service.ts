import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'cart';
  
  // BehaviorSubject mantém o estado atual do carrinho e emite para todos os subscribers ao mudar
  private items = new BehaviorSubject<any[]>(this.loadFromStorage());
  // Observable público, componentes assinam este stream para reagir a mudanças no carrinho
  items$ = this.items.asObservable();

  // Carrega o estado persistido ao inicializar o serviço
  private loadFromStorage(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Sincroniza o estado em memória com o localStorage após cada operação
  private saveOnStorage(items: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  // Se o produto já existe no carrinho, delega ao incrementItem em vez de duplicar
  addItem(product: any): void {
    const cart = this.items.getValue();
    const exists = cart.find((i) => i.id === product.id);

    if (exists) {
      this.incrementItem(product.id);
      return;
    }

    const newCart = [...cart, { ...product, quantity: 1 }];
    this.items.next(newCart);
    this.saveOnStorage(newCart);
  }

  // Incrementa um item existente pelo id
  incrementItem(id: number): void {
    const newCart = this.items
      .getValue()
      .map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
    this.items.next(newCart);
    this.saveOnStorage(newCart);
  }

  // Quantidade 1 remove o item; acima de 1 apenas decrementa
  decrementItem(id: number): void {
    const cart = this.items.getValue();
    const item = cart.find((i) => i.id === id);

    if (!item) return;

    const newCart =
      item.quantity === 1
        ? cart.filter((i) => i.id !== id)
        : cart.map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i));

    this.items.next(newCart);
    this.saveOnStorage(newCart);
  }

  // Remove um item do carrinho pelo id
  removeItem(id: number): void {
    const newCart = this.items.getValue().filter((i) => i.id !== id);
    this.items.next(newCart);
    this.saveOnStorage(newCart);
  }

  // Retorna o valor total da compra (soma dos valores de todos o itens no carrinho)
  getTotal(): number {
    return this.items.getValue().reduce((acc, item) => acc + item.price * item.quantity, 0);
  }
}
