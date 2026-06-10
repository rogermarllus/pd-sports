import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, provideRouter, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, BehaviorSubject, throwError } from 'rxjs';

import { CartPageComponent } from './cart-page.component';
import { CartService } from '../../../core/services/cart.service';
import { FreightService } from '../../../core/services/freight.service';
import { AuthService } from '../../../core/services/auth.service';

const mockCartItems = [
  {
    id: 1,
    name: 'Chuteira Adidas F50',
    price: 399.9,
    quantity: 2,
    modality: 'Futebol',
    imageName: 'adidas-f50',
  },
  {
    id: 2,
    name: 'Bola UEFA Champions',
    price: 150.0,
    quantity: 1,
    modality: 'Basquete',
    imageName: 'bola-uefa',
  },
];

describe('CartPageComponent', () => {
  let component: CartPageComponent;
  let fixture: ComponentFixture<CartPageComponent>;

  let cartServiceSpy: any;
  let freightServiceSpy: any;
  let authServiceSpy: any;
  let routerSpy: any;
  let cartItemsSubject: BehaviorSubject<any[]>;

  beforeAll(() => {
    (globalThis as any).lucide = {
      createIcons: () => {},
    };
  });

  beforeEach(async () => {
    cartItemsSubject = new BehaviorSubject<any[]>(mockCartItems);

    cartServiceSpy = {
      items$: cartItemsSubject.asObservable(),
      getTotal: vi.fn().mockReturnValue(949.8),
      incrementItem: vi.fn(),
      decrementItem: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    };

    freightServiceSpy = {
      calculateFreight: vi.fn().mockReturnValue(
        of([
          { name: 'Sedex', price: 25.5, delivery_time: 2 },
          { name: 'PAC', price: 12.0, delivery_time: 7 },
        ]),
      ),
    };

    authServiceSpy = {
      isLogged: vi.fn().mockReturnValue(true),
    };

    routerSpy = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      declarations: [CartPageComponent],
      imports: [RouterModule, FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceSpy },
        { provide: FreightService, useValue: freightServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Estado Inicial', () => {
    it('should load cart items on initialization', () => {
      expect(component.items.length).toBe(2);
      expect(component.items).toEqual(mockCartItems);
    });

    it('should initialize with default checkout configurations', () => {
      expect(component.cep).toBe('');
      expect(component.modalOpen).toBe(false);
      expect(component.currentStep).toBe(1);
      expect(component.chosenMethod).toBe('pix');
    });

    it('should accurately compute getters', () => {
      expect(component.subtotal).toBe(949.8);
      expect(component.totalQuantity).toBe(3);
      expect(component.shippingPrice).toBe(0);
      expect(component.total).toBe(949.8);
    });
  });

  describe('Ações do Carrinho', () => {
    it('should delegate increment to CartService', () => {
      component.increment(1);
      expect(cartServiceSpy.incrementItem).toHaveBeenCalledWith(1);
    });

    it('should delegate decrement to CartService and reset shipping', () => {
      component.selectedShipping = { name: 'PAC', price: 12 };
      component.decrement(1);
      expect(cartServiceSpy.decrementItem).toHaveBeenCalledWith(1);
      expect(component.selectedShipping).toBeNull();
    });

    it('should delegate remove to CartService and reset shipping', () => {
      component.selectedShipping = { name: 'PAC', price: 12 };
      component.remove(2);
      expect(cartServiceSpy.removeItem).toHaveBeenCalledWith(2);
      expect(component.selectedShipping).toBeNull();
    });

    it('should return correct image path mapping', () => {
      const soccerItem = mockCartItems[0];
      const basketballItem = mockCartItems[1];

      expect(component.getImagePath(soccerItem)).toBe('/img/products/soccer/adidas-f50.avif');
      expect(component.getImagePath(basketballItem)).toBe(
        '/img/products/basketball/bola-uefa.avif',
      );
    });
  });

  describe('Fluxo de Frete', () => {
    it('should format and apply mask to CEP input entry', () => {
      const mockEvent = { target: { value: '12345678' } } as unknown as Event;
      component.onCepInput(mockEvent);
      expect(component.cep).toBe('12345-678');
    });

    it('should show error message if CEP length is invalid', () => {
      component.cep = '123';
      component.calcularFrete();
      expect(component.freightError).toBe('Informe um CEP válido com 8 dígitos.');
      expect(freightServiceSpy.calculateFreight).not.toHaveBeenCalled();
    });

    it('should call FreightService and sort results by lowest price', () => {
      component.cep = '12345-678';
      component.calcularFrete();

      expect(freightServiceSpy.calculateFreight).toHaveBeenCalledWith('12345678');
      expect(component.shippingOptions.length).toBe(2);
      expect(component.shippingOptions[0].name).toBe('PAC');
      expect(component.selectedShipping?.name).toBe('PAC');
    });

    it('should handle freight service failures gracefully', () => {
      freightServiceSpy.calculateFreight.mockReturnValue(
        throwError(() => new Error('API Timeout')),
      );
      component.cep = '12345-678';
      component.calcularFrete();

      expect(component.freightError).toBe('API Timeout');
      expect(component.isCalculatingFreight).toBe(false);
    });

    it('should update selected shipping price when chosen', () => {
      const option = { name: 'Sedex', price: 25.5 };
      component.selectShipping(option);
      expect(component.selectedShipping).toEqual(option);
      expect(component.shippingPrice).toBe(25.5);
      expect(component.total).toBe(949.8 + 25.5);
    });
  });

  describe('Fluxo do Modal de Pagamento', () => {
    it('should redirect to auth/login if user triggers checkout while anonymous', () => {
      authServiceSpy.isLogged.mockReturnValue(false);
      component.openModal();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should trigger browser alert if cart is empty', () => {
      component.items = [];
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      component.openModal();
      expect(alertSpy).toHaveBeenCalledWith('Seu carrinho está vazio.');
    });

    it('should initialize structural step data when modal expands successfully', () => {
      component.openModal();
      expect(component.modalOpen).toBe(true);
      expect(component.currentStep).toBe(1);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should release body overflow context when closing modal', () => {
      component.openModal();
      component.closeModal();
      expect(component.modalOpen).toBe(false);
      expect(document.body.style.overflow).toBe('');
    });

    it('should route user across dynamic steps and switch payment methods', () => {
      component.goToStep(2);
      expect(component.currentStep).toBe(2);

      component.selectMethod('credit');
      expect(component.chosenMethod).toBe('credit');
    });

    it('should block credit card submission if inputs are incomplete', () => {
      component.chosenMethod = 'credit';
      component.cardNum = '';
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      component.confirmPayment();
      expect(alertSpy).toHaveBeenCalledWith('Preencha todos os dados do cartão corretamente.');
      expect(component.currentStep).not.toBe(3);
    });

    it('should advance to success screen and generate token code if payment matches parameters', () => {
      component.chosenMethod = 'pix';
      component.confirmPayment();

      expect(component.orderNumber).toContain('PD-');
      expect(component.currentStep).toBe(3);
    });

    it('should completely purge structural variables upon clicking to return to shopping', () => {
      component.finishShopping();
      expect(cartServiceSpy.clearCart).toHaveBeenCalled();
      expect(component.modalOpen).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Formatações e Máscaras Auxiliares', () => {
    it('should format numbers to standard currency BRL string format', () => {
      const result = component.formatBRL(1250.5);
      expect(result).toMatch(/R\$\s?1\.250,50/);
      expect(result.replace(/\u00a0/g, ' ')).toContain('R$ 1.250,50');
    });

    it('should apply inline text spacing intervals on card input masking', () => {
      const mockEvent = { target: { value: '1234567812345678' } } as unknown as Event;
      component.onCardNumInput(mockEvent);
      expect(component.cardNum).toBe('1234 5678 1234 5678');
    });

    it('should slice inline date dividers into month and year mask models', () => {
      const mockEvent = { target: { value: '1129' } } as unknown as Event;
      component.onCardExpInput(mockEvent);
      expect(component.cardExp).toBe('11/29');
    });
  });
});
