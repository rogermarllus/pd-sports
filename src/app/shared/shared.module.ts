import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { CurrencyBrlPipe } from './pipes/currency-brl-pipe';

@NgModule({
  // Componentes, pipes e diretivas reutilizáveis serão declarados e exportados aqui nas FEATs seguintes.
  declarations: [NavbarComponent, FooterComponent, ProductCardComponent, CurrencyBrlPipe],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [NavbarComponent, FooterComponent, ProductCardComponent, CurrencyBrlPipe],
})
export class SharedModule {}
