import { NgModule } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterLink } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { CurrencyBrlPipe } from './pipes/currency-brl-pipe';
import { FieldErrorDirective } from './directives/field-error.directive';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    CurrencyBrlPipe,
    FieldErrorDirective,
  ],
  imports: [ReactiveFormsModule, FormsModule, RouterLink, AsyncPipe],
  exports: [
    NavbarComponent,
    FooterComponent,
    ProductCardComponent,
    CurrencyBrlPipe,
    FieldErrorDirective,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class SharedModule {}
