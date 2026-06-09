import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartRoutingModule } from './cart.routing.module';
import { CartPageComponent } from './cart-page/cart-page.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [CartPageComponent],
  imports: [CommonModule, CartRoutingModule, SharedModule],
})
export class CartModule {}
