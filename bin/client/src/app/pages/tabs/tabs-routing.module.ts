import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
//import { AuthGuard } from '../../guards/auth.guard'; // TODO add guards

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
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
      }
    ]
  },
  {
    path: 'mqtt',
    loadChildren: () => import('../mqtt-config/mqtt-config.module').then(m => m.MqttConfigPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('../notifications/notifications.module').then(m => m.NotificationsPageModule)
  },
  {
    path: 'about',
    loadChildren: () => import('../about/about.module').then(m => m.AboutPageModule)
  },
  {
    path: 'home/:controlSerialNr/:controlUuid',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: ':domain/:serialNr/:uuid/:controlSerialNr/:controlUuid',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: ':domain/:serialNr/:uuid/:controlSerialNr/:controlUuid/:subControlUuid',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: ':domain/:serialNr/:uuid/:controlSerialNr/:controlUuid/:subControlUuid/:subControlUuidExt',
    loadChildren: () => import('../detailed-control/detailed-control.module').then(m => m.DetailedControlPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
