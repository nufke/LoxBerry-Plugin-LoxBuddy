import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetailedControlPage } from './detailed-control.page';
import { DetailedControlPageRoutingModule } from './detailed-control-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { ViewsModule } from '../../views/views.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: DetailedControlPage }]),
    DetailedControlPageRoutingModule,
    ViewsModule,
    TranslateModule
  ],
  declarations: [
    DetailedControlPage
  ],
  providers: [
  ]
})
export class DetailedControlPageModule {}
