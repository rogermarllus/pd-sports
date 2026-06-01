import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { RouterModule, provideRouter } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { of } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    (window as any)['lucide'] = { createIcons: () => {} };

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [RouterModule, AsyncPipe],
      providers: [
        provideRouter([]),
        {
          provide: CartService,
          useValue: { items$: of([]) },
        },
        {
          provide: AuthService,
          useValue: { getCurrentUser: () => null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
