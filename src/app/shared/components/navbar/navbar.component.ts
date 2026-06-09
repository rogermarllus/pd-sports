import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

declare const lucide: any;

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private router = inject(Router);

  ngAfterViewInit() {
    lucide.createIcons();
  }

  get user() {
    return this.authService.getCurrentUser();
  }

  get firstName(): string {
    return this.user?.name?.trim().split(' ')[0] || '';
  }

  search(term: string) {
    if (!term.trim()) return;
    this.router.navigate(['/products/search'], { queryParams: { query: term.trim() } });
  }
}
