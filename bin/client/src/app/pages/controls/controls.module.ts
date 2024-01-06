import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ControlsPage } from './controls.page';
import { ControlsPageRoutingModule } from './controls-routing.module';
import { ViewsModule } from '../../views/views.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ControlsPage }]),
    ControlsPageRoutingModule,
    TranslateModule,
    ViewsModule
  ],
  declarations: [
    ControlsPage
  ],
  providers: [
  ]
})
export class ControlsPageModule {}
