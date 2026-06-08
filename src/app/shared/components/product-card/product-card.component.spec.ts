import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';
import { CurrencyBrlPipe } from '../../pipes/currency-brl-pipe';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule, provideRouter } from '@angular/router';

describe('ProductCardComponent', () => {
  beforeAll(() => {
    (globalThis as any).lucide = {
      createIcons: () => {},
    };
  });
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductCardComponent, CurrencyBrlPipe],
      imports: [RouterModule],
      providers: [
        provideRouter([]),
        {
          provide: CartService,
          useValue: { addItem: () => {} },
        },
        {
          provide: AuthService,
          useValue: {
            getCurrentUser: () => null,
            isLogged: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
