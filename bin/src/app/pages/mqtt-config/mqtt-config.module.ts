import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MqttConfigPageRoutingModule } from './mqtt-config-routing.module';
import { MqttConfigPage } from './mqtt-config.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MqttConfigPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [
    MqttConfigPage
  ]
})

export class MqttConfigPageModule {}
