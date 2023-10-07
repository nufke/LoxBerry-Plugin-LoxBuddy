import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { LockPageRoutingModule } from './lock-routing.module';
import { LockPage } from './lock.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LockPageRoutingModule,
    TranslateModule.forChild()
  ],
  declarations: [LockPage]
})
export class LockPageModule {}
