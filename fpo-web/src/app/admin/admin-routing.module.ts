import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from 'app/admin/admin.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    data: {
      title: 'New Responses'
    }
  },
  {
    path: 'admin/new-responses',
    component: AdminComponent,
    data: {
      title: 'New Responses'
    }
  },
  {
    path: 'admin/archive',
    component: AdminComponent,
    data : {
      title: 'Archive'
    }
  },
  {
    path: 'admin/contact',
    component: AdminComponent
  }
];

@NgModule({
  imports: [RouterModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
