import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router';

@NgModule({
  // Componentes, pipes e diretivas reutilizáveis serão declarados e exportados aqui nas FEATs seguintes.
  declarations: [NavbarComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  exports: [NavbarComponent],
})
export class SharedModule {}
