import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TabsPageRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';
import { DirectivesModule } from '../../directives/directives.module'
import { LockscreenService } from '../../services/lockscreen.service';
import { LockPageModule } from '../lock/lock.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    TranslateModule.forChild(),
    DirectivesModule,
    LockPageModule
  ],
  declarations: [
    TabsPage
  ],
  providers: [
    LockscreenService
  ]
})
export class TabsPageModule {}
