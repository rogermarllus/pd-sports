import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { ModalitiesComponent } from './modalities/modalities.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'modalidades/:modality', component: ModalitiesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
