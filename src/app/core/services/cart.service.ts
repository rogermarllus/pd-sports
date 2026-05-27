import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'cart';

  private items = new BehaviorSubject<any[]>(this.loadFromStorage());
  items$ = this.items.asObservable();

  private loadFromStorage(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveOnStorage(items: any[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  adicionarItem(product: any): void {
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

  incrementItem(id: number): void {
    const newCart = this.items
      .getValue()
      .map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
    this.items.next(newCart);
    this.saveOnStorage(newCart);
  }

  decrementarItem(id: number): void {
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

  removerItem(id: number): void {
    const newCart = this.items.getValue().filter((i) => i.id !== id);
    this.items.next(newCart);
    this.saveOnStorage(newCart);
  }

  getTotal(): number {
    return this.items.getValue().reduce((acc, item) => acc + item.price * item.quantity, 0);
  }
}
