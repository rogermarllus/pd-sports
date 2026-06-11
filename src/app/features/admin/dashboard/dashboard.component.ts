import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  readonly stats = {
    totalRevenue: 127845.9,
    totalOrders: 342,
    totalCustomers: 1256,
  };

  readonly dailySales = [
    { date: '10 de mar.', percentage: 67, value: 15456.0 },
    { date: '11 de mar.', percentage: 82, value: 18650.0 },
    { date: '12 de mar.', percentage: 56, value: 12890.0 },
    { date: '13 de mar.', percentage: 93, value: 21340.0 },
    { date: '14 de mar.', percentage: 86, value: 19780.0 },
    { date: '15 de mar.', percentage: 73, value: 16890.0 },
    { date: '16 de mar.', percentage: 100, value: 22875.0 },
  ];

  readonly topCategories = [
    { name: 'Futebol', percentage: 58.6 },
    { name: 'Corrida', percentage: 29.2 },
    { name: 'Basquete', percentage: 12.2 },
  ];

  readonly topProducts = [
    { name: 'Chuteira seleção Brasileira', soldQuantity: 89, revenue: 81115.0 },
    { name: 'Camisa do Flamengo', soldQuantity: 67, revenue: 76115.0 },
    { name: 'Tênis de corrida Sport', soldQuantity: 55, revenue: 42135.0 },
    { name: 'Meia para treino academia', soldQuantity: 32, revenue: 24205.0 },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
