import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products.routing.module';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { SearchResultComponent } from './search-result/search-result.component';

@NgModule({
  declarations: [ProductDetailsComponent, SearchResultComponent],
  imports: [CommonModule, ProductsRoutingModule],
})
export class ProductsModule {}
