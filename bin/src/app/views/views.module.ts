import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
//import { SwiperModule } from 'swiper/angular';
import { ControlAlarmView } from './control-alarm/control-alarm.view';
import { ControlAlarmHistoryView } from './control-alarm-history/control-alarm-history.view';
import { ControlTextStateView } from './control-text-state/control-text-state.view';
import { ControlSwitchView } from './control-switch/control-switch.view';
import { ControlSliderView } from './control-slider/control-slider.view';
import { ControlPushbuttonView } from './control-pushbutton/control-pushbutton.view';
import { ControlLightV2View } from './control-light-v2/control-light-v2.view';
import { ControlCentralLightView } from './control-central-light/control-central-light.view';
import { ControlRadioView } from './control-radio/control-radio.view';
import { ControlIRCView } from './control-irc/control-irc.view';
import { ControlColorPickerV2View } from './control-color-picker-v2/control-color-picker-v2.view';
import { ControlUpDownDigitalView } from './control-up-down-digital/control-up-down-digital.view';
import { ControlJalousieView } from './control-jalousie/control-jalousie.view';
import { ControlWebpageView } from './control-webpage/control-webpage.view';
import { CardTextView } from './card-text/card-text.view';
import { CardSliderView } from './card-slider/card-slider.view';
import { CardRadioListView } from './card-radio-list/card-radio-list.view';
import { CardSwitchView } from './card-switch/card-switch.view';
import { CardDimmerView } from './card-dimmer/card-dimmer.view';
import { ElementColorRGBPickerView } from './element-color-rgb-picker/element-color-rgb-picker.view';
import { ElementColorTempPickerView } from './element-color-temp-picker/element-color-temp-picker.view';
import { ElementThermostatView } from './element-thermostat/element-thermostat.view';
import { DirectivesModule } from '../directives/directives.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    DirectivesModule,
//    SwiperModule
  ],
  declarations: [
    ControlAlarmView,
    ControlAlarmHistoryView,
    ControlTextStateView,
    ControlSwitchView,
    ControlSliderView,
    ControlPushbuttonView,
    ControlLightV2View,
    ControlCentralLightView,
    ControlRadioView,
    ControlColorPickerV2View,
    ControlIRCView,
    ControlUpDownDigitalView,
    ControlJalousieView,
    ControlWebpageView,
    CardTextView,
    CardRadioListView,
    CardSliderView,
    CardSwitchView,
    CardDimmerView,
    ElementColorRGBPickerView,
    ElementColorTempPickerView,
    ElementThermostatView
  ],
  exports: [
    IonicModule,
    RouterModule,
    ControlAlarmView,
    ControlAlarmHistoryView,
    ControlTextStateView,
    ControlSwitchView,
    ControlSliderView,
    ControlPushbuttonView,
    ControlLightV2View,
    ControlCentralLightView,
    ControlRadioView,
    ControlColorPickerV2View,
    ControlIRCView,
    ControlUpDownDigitalView,
    ControlJalousieView,
    ControlWebpageView,
    CardTextView,
    CardRadioListView,
    CardSliderView,
    CardSwitchView,
    CardDimmerView,
    ElementColorRGBPickerView,
    ElementColorTempPickerView,
    ElementThermostatView
  ]
})
export class ViewsModule { }
