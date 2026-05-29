import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  // Componentes, pipes e diretivas reutilizáveis serão declarados e exportados aqui nas FEATs seguintes.
  declarations: [NavbarComponent, FooterComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [NavbarComponent, FooterComponent],
})
export class SharedModule {}
