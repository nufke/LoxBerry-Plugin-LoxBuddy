import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
//import { SwiperModule } from 'swiper/angular';
import { CardDimmerView } from './card-dimmer/card-dimmer.view';
import { CardRadioListView } from './card-radio-list/card-radio-list.view';
import { CardSliderView } from './card-slider/card-slider.view';
import { CardSwitchView } from './card-switch/card-switch.view';
import { CardTextView } from './card-text/card-text.view';
import { ControlAlarmView } from './control-alarm/control-alarm.view';
import { ControlCentralLightView } from './control-central-light/control-central-light.view';
import { ControlColorPickerV2View } from './control-color-picker-v2/control-color-picker-v2.view';
import { ControlDaytimerView } from './control-daytimer/control-daytimer.view';
import { ControlFroniusView } from './control-fronius/control-fronius.view';
import { ControlIntercomView } from './control-intercom/control-intercom.view';
import { ControlIRCView } from './control-irc/control-irc.view';
import { ControlJalousieView } from './control-jalousie/control-jalousie.view';
import { ControlLightV2View } from './control-light-v2/control-light-v2.view';
import { ControlPushbuttonView } from './control-pushbutton/control-pushbutton.view';
import { ControlRadioView } from './control-radio/control-radio.view';
import { ControlSwitchView } from './control-switch/control-switch.view';
import { ControlSliderView } from './control-slider/control-slider.view';
import { ControlSmokeAlarmView } from './control-smokealarm/control-smokealarm.view';
import { ControlTextStateView } from './control-text-state/control-text-state.view';
import { ControlTrackerView } from './control-tracker/control-tracker.view';
import { ControlUnknownView } from './control-unknown/control-unknown.view';
import { ControlUpDownDigitalView } from './control-up-down-digital/control-up-down-digital.view';
import { ControlWebpageView } from './control-webpage/control-webpage.view';
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
    CardDimmerView,
    CardRadioListView,
    CardSliderView,
    CardSwitchView,
    CardTextView,
    ControlAlarmView,
    ControlCentralLightView,
    ControlColorPickerV2View,
    ControlDaytimerView,
    ControlFroniusView,
    ControlIntercomView,
    ControlIRCView,
    ControlJalousieView,
    ControlLightV2View,
    ControlPushbuttonView,
    ControlRadioView,
    ControlSliderView,
    ControlSmokeAlarmView,
    ControlSwitchView,
    ControlTextStateView,
    ControlTrackerView,
    ControlUnknownView,
    ControlUpDownDigitalView,
    ControlWebpageView,
    ElementColorRGBPickerView,
    ElementColorTempPickerView,
    ElementThermostatView
  ],
  exports: [
    IonicModule,
    RouterModule,
    CardDimmerView,
    CardRadioListView,
    CardSliderView,
    CardSwitchView,
    CardTextView,
    ControlAlarmView,
    ControlCentralLightView,
    ControlColorPickerV2View,
    ControlDaytimerView,
    ControlFroniusView,
    ControlIntercomView,
    ControlIRCView,
    ControlJalousieView,
    ControlLightV2View,
    ControlPushbuttonView,
    ControlRadioView,
    ControlSliderView,
    ControlSmokeAlarmView,
    ControlSwitchView,
    ControlTextStateView,
    ControlTrackerView,
    ControlUnknownView,
    ControlUpDownDigitalView,
    ControlWebpageView,
    ElementColorRGBPickerView,
    ElementColorTempPickerView,
    ElementThermostatView
  ]
})
export class ViewsModule { }
