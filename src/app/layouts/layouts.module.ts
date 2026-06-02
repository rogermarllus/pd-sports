import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { MainLayoutComponent } from './main-layout/main-layout.component';

@NgModule({
  declarations: [MainLayoutComponent],
  imports: [CommonModule, RouterModule, SharedModule],
  exports: [MainLayoutComponent],
})
export class LayoutModule {}
