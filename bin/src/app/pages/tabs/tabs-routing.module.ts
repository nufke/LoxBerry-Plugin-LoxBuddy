import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
//import { AuthGuard } from '../../guards/auth.guard'; // TODO add guards

const routes: Routes = [
  {
    path: 'app',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsPageModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'room',
        loadChildren: () => import('../rooms/rooms.module').then(m => m.RoomsPageModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'room/:serialNr/:uuid',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsPageModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'category',
        loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'category/:serialNr/:uuid',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsPageModule),
        //canActivate: [AuthGuard]
      },
    ]
  },
  {
    path: 'app/home/:controlSerialNr/:control_uuid',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'app/:domain/:serialNr/:uuid/:controlSerialNr/:control_uuid',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'app/:domain/:serialNr/:uuid/:controlSerialNr/:control_uuid/:subControlUuid',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'app/:domain/:serialNr/:uuid/:controlSerialNr/:control_uuid/:subControlUuid/:subControlUuidExt',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'app/home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
