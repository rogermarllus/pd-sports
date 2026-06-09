import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule, provideRouter } from '@angular/router';

import { ProductDetailsComponent } from './product-details.component';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl-pipe';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductDetailsComponent, CurrencyBrlPipe],
      imports: [RouterModule],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: { getById: () => ({ price: 100 }) },
        },
        {
          provide: CartService,
          useValue: { addItem: () => {} },
        },
        {
          provide: AuthService,
          useValue: { isLogged: () => false },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
