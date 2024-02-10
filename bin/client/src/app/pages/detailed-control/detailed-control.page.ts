import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IonRouterOutlet } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Control, SubControl, Room } from '../../interfaces/data.model';
import { ControlService } from '../../services/control.service';
import { View } from '../../types/types';
import { ControlAlarmView } from '../../views/control-alarm/control-alarm.view';
import { ControlCentralLightView } from '../../views/control-central-light/control-central-light.view';
import { ControlColorPickerV2View } from '../../views/control-color-picker-v2/control-color-picker-v2.view';
import { ControlDaytimerView } from '../../views/control-daytimer/control-daytimer.view';
import { ControlFroniusView } from '../../views/control-fronius/control-fronius.view';
import { ControlIntercomView } from '../../views/control-intercom/control-intercom.view';
import { ControlIRCView } from '../../views/control-irc/control-irc.view';
import { ControlJalousieView } from '../../views/control-jalousie/control-jalousie.view';
import { ControlLightV2View } from '../../views/control-light-v2/control-light-v2.view';
import { ControlPushbuttonView } from '../../views/control-pushbutton/control-pushbutton.view';
import { ControlRadioView } from '../../views/control-radio/control-radio.view';
import { ControlSliderView } from '../../views/control-slider/control-slider.view';
import { ControlSmokeAlarmView } from '../../views/control-smokealarm/control-smokealarm.view';
import { ControlSwitchView } from '../../views/control-switch/control-switch.view';
import { ControlTextStateView } from '../../views/control-text-state/control-text-state.view';
import { ControlTrackerView } from '../../views/control-tracker/control-tracker.view';
import { ControlUnknownView } from '../../views/control-unknown/control-unknown.view';
import { ControlUpDownDigitalView } from '../../views/control-up-down-digital/control-up-down-digital.view';
import { ControlWebpageView } from '../../views/control-webpage/control-webpage.view';

@Component({
  selector: 'app-detailed-control',
  templateUrl: 'detailed-control.page.html',
  styleUrls: ['./detailed-control.page.scss']
})
export class DetailedControlPage
  implements OnInit, OnDestroy {

  @ViewChild('viewcontainer', { read: ViewContainerRef, static: true }) viewContainer: ViewContainerRef;

  componentRef;
  viewType = View;

  control: Control;
  rooms: Room[];
  page_name: string;

  canGoBack: boolean;

  private controlSubscription: Subscription;
  private roomSubscription: Subscription;

  private ViewMap = {
    'Alarm': ControlAlarmView,
    'CentralLightController': ControlCentralLightView,
    'ColorPickerV2': ControlColorPickerV2View,
    'Daytimer': ControlDaytimerView,
    'Fronius': ControlFroniusView,
    'InfoOnlyAnalog': ControlTextStateView,
    'InfoOnlyDigital': ControlTextStateView,
    'InfoOnlyText': ControlTextStateView,
    'Intercom': ControlIntercomView,
    'IRoomController': ControlIRCView,
    'Jalousie': ControlJalousieView,
    'LightControllerV2': ControlLightV2View,
    'Pushbutton': ControlPushbuttonView,
    'Radio': ControlRadioView,
    'Slider': ControlSliderView,
    'SmokeAlarm': ControlSmokeAlarmView,
    'Switch': ControlSwitchView,
    'TextState': ControlTextStateView,
    'Tracker': ControlTrackerView,
    'Unknown': ControlUnknownView,
    'UpDownDigital': ControlUpDownDigitalView,
    'Webpage': ControlWebpageView,
  }

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private controlService: ControlService,
    private ionRouterOutlet: IonRouterOutlet ) {
    }

  ngOnInit(): void {
    this.canGoBack = this.ionRouterOutlet.canGoBack();
    this.initVM();
  }

  ngOnDestroy(): void {
    this.viewContainer.clear(); // remove dynamic view from memory
    this.componentRef = -1;
    this.controlSubscription.unsubscribe();
    this.roomSubscription.unsubscribe();
  }

  private initVM(): void {
    const controlSerialNr = this.route.snapshot.paramMap.get('controlSerialNr');
    const controlUuid = this.route.snapshot.paramMap.get('controlUuid');
    const subControlUuid = this.route.snapshot.paramMap.get('subControlUuid');
    const subControlUuidExt = this.route.snapshot.paramMap.get('subControlUuidExt');

    this.roomSubscription = this.controlService.rooms$.subscribe(
      rooms => { this.rooms = rooms;
    });

    this.controlSubscription = this.controlService.getControl$(controlSerialNr, controlUuid).subscribe(
      control => {
        if (!control) return; // no valid control yet

        this.control = control;
        let room = this.rooms.find( room => (room.uuid === control.room) && (room.serialNr === control.serialNr));

        switch (control.type) {
          case 'IRoomController':
            this.page_name = ((control.name === this.translate.instant('IRoomController')) ||
                              (control.name === this.translate.instant('IRoomController_'))) ? this.translate.instant('Thermostat') : control.name;
            break;
          case 'LightControllerV2':
            /* TODO: Loxone replaces default controller name with room name, should we keep it? */
            this.page_name = ((control.name === this.translate.instant('Lightcontroller') ||
                              (control.name === this.translate.instant('LightcontrollerV2'))) &&
                               room != undefined) ? room.name : control.name;
            break;
          default:
            this.page_name = control.name;
        }

        if (!subControlUuid && !subControlUuidExt) { // no subcontrol, we can load the component here...
          this.loadControlComponent(control, null, control.type);
        }
      }
    );

    if (subControlUuid && subControlUuidExt) {
      this.controlService.getSubControl$(controlSerialNr, controlUuid, subControlUuid + '/' + subControlUuidExt).subscribe(
        subControl => {
          if (!subControl) return; // no valid subcontrol yet
          if (subControlUuidExt === 'sensors') { // for control Alarm and SmokeAlarm
            this.page_name = this.translate.instant('History');
          } else {
            this.page_name = subControl.name;
          }
          if (this.control) { // load the component here when it is a subcontrol
            this.loadControlComponent(this.control, subControl, subControl.type);
          }
        }
      );
    }
  }

  private loadControlComponent(control: Control, subControl: SubControl, type: string) {
    if (!this.componentRef) { // only create if dynamic view does not exist yet, and viewContainer exists
      this.componentRef = this.viewContainer.createComponent(this.getControlView(type));
      (this.componentRef.instance).control = control;
      (this.componentRef.instance).view = View.DETAILED;
      if (subControl != null) { // for subControls we pass this.
        (this.componentRef.instance).subControl = subControl;
      }
    }
  }

  private getControlView(type) {
    let view = this.ViewMap[type];
    if (view) {
      return this.ViewMap[type];
    } else {
      return this.ViewMap['Unknown']; // default
    }
  }
}
