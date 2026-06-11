import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { vi } from 'vitest';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl-pipe';

const authServiceMock = {
  logout: vi.fn(),
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      declarations: [DashboardComponent, CurrencyBrlPipe],
      imports: [RouterModule],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('Dados Estáticos', () => {
    it('deve inicializar com as métricas de resumo corretas', () => {
      expect(component.stats.totalRevenue).toBe(127845.9);
      expect(component.stats.totalOrders).toBe(342);
      expect(component.stats.totalCustomers).toBe(1256);
    });

    it('deve conter as 3 categorias principais no ranking', () => {
      expect(component.topCategories.length).toBe(3);
      expect(component.topCategories[0].name).toBe('Futebol');
      expect(component.topCategories[0].percentage).toBe(58.6);
    });

    it('deve conter o histórico de vendas mapeado para 7 dias', () => {
      expect(component.dailySales.length).toBe(7);
      expect(component.dailySales[0].date).toBe('10 de mar.');
    });

    it('deve listar os 4 produtos mais vendidos', () => {
      expect(component.topProducts.length).toBe(4);
      expect(component.topProducts[0].name).toBe('Chuteira seleção Brasileira');
    });
  });

  describe('Ações do Painel', () => {
    it('deve invocar o AuthService.logout e redirecionar para a rota de login ao sair', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onLogout();

      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
