import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterOutlet } from '@angular/router';

import { MainLayoutComponent } from './main-layout.component';

@Component({
  selector: 'app-navbar',
  template: '',
  standalone: false,
})
class MockNavbarComponent {}

@Component({
  selector: 'app-footer',
  template: '',
  standalone: false,
})
class MockFooterComponent {}

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainLayoutComponent, MockNavbarComponent, MockFooterComponent],
      imports: [RouterOutlet],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
