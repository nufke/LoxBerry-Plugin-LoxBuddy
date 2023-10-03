import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Control, SubControl, Room } from '../../interfaces/data.model';
import { ControlService } from '../../services/control.service';
import { View } from '../../types/types';
import { ControlAlarmView } from '../../views/control-alarm/control-alarm.view';
import { ControlAlarmHistoryView } from '../../views/control-alarm-history/control-alarm-history.view';
import { ControlCentralLightView } from '../../views/control-central-light/control-central-light.view';
import { ControlColorPickerV2View } from '../../views/control-color-picker-v2/control-color-picker-v2.view';
import { ControlDaytimerView } from '../../views/control-daytimer/control-daytimer.view';
import { ControlIRCView } from '../../views/control-irc/control-irc.view';
import { ControlJalousieView } from '../../views/control-jalousie/control-jalousie.view';
import { ControlLightV2View } from '../../views/control-light-v2/control-light-v2.view';
import { ControlPushbuttonView } from '../../views/control-pushbutton/control-pushbutton.view';
import { ControlRadioView } from '../../views/control-radio/control-radio.view';
import { ControlSliderView } from '../../views/control-slider/control-slider.view';
import { ControlSmokeAlarmView } from '../../views/control-smokealarm/control-smokealarm.view';
import { ControlSwitchView } from '../../views/control-switch/control-switch.view';
import { ControlTextStateView } from '../../views/control-text-state/control-text-state.view';
import { ControlUpDownDigitalView } from '../../views/control-up-down-digital/control-up-down-digital.view';
import { ControlWebpageView } from '../../views/control-webpage/control-webpage.view';

@Component({
  selector: 'app-detailed-control',
  templateUrl: 'detailed-control.page.html',
  styleUrls: ['./detailed-control.page.scss']
})
export class DetailedControlPage
  implements OnInit, OnDestroy {

  @ViewChild('viewcontainer', { read: ViewContainerRef, static: true })

  viewContainer: ViewContainerRef;
  componentRef;
  viewType = View;

  control: Control;
  rooms: Room[];
  subControl: SubControl;
  page_name: string;
  type: string;

  private controlSubscription: Subscription;
  private roomSubscription: Subscription;

  // TODO, merge/move with IRC component
  private irc_mode = [
    { id: 0, name: 'Automatic' },
    { id: 1, name: 'Automatic (currently heating)' },
    { id: 2, name: 'Automatic (currently cooling)' },
    { id: 3, name: 'Automatic heating' },
    { id: 4, name: 'Automatic cooling' },
    { id: 5, name: 'Manual heating' },
    { id: 6, name: 'Manual cooling' }
  ];

  private ViewMap = {
    'Alarm': ControlAlarmView,
    'AlarmHistory': ControlAlarmHistoryView,
    'CentralLightController': ControlCentralLightView,
    'ColorPickerV2': ControlColorPickerV2View,
    'Daytimer': ControlDaytimerView,
    'InfoOnlyAnalog': ControlTextStateView,
    'InfoOnlyDigital': ControlTextStateView,
    'InfoOnlyText': ControlTextStateView,
    'IRoomController': ControlIRCView,
    'Jalousie': ControlJalousieView,
    'LightControllerV2': ControlLightV2View,
    'Pushbutton': ControlPushbuttonView,
    'Radio': ControlRadioView,
    'Slider': ControlSliderView,
    'SmokeAlarm': ControlSmokeAlarmView,
    'Switch': ControlSwitchView,
    'TextState': ControlTextStateView,
    'UpDownDigital': ControlUpDownDigitalView,
    'Webpage': ControlWebpageView,
  }

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private controlService: ControlService ) {
    this.initVM();
  }

  ngOnInit(): void {
    this.loadControlComponent(this.control, this.type);
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
        this.control = control;
        this.type = control.type;
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
          case 'Alarm': /* no action */
            if (subControlUuid && (subControlUuid === 'history')) {
              this.subControl = null;
              this.type = 'AlarmHistory';
              this.page_name = this.translate.instant('History');
            } else {
              this.page_name = control.name;
            }
            break;
          default:
            this.page_name = control.name;
        }
      }
    );

    if (subControlUuid && subControlUuidExt) {
      this.controlService.getSubControl$(controlSerialNr, controlUuid, subControlUuid + '/' + subControlUuidExt).subscribe(
        subControl => {
          this.subControl = subControl;
          this.type = subControl.type;
          this.page_name = subControl.name;
        }
      );
    }
  }

  private loadControlComponent(control: Control, type: string) {
    if (!this.componentRef) { // only create if dynamic view does not exist yet
      this.componentRef = this.viewContainer.createComponent(this.getControlView(type));
      (this.componentRef.instance).control = control;
      (this.componentRef.instance).view = View.DETAILED;
      if (this.subControl != null) { // for subControls we pass this.
        (this.componentRef.instance).subControl = this.subControl;
      }
    }
  }

  private getControlView(type) {
    let view = this.ViewMap[type];
    if (view) {
      return this.ViewMap[type];
    } else {
      return this.ViewMap['TextState']; // default
    }
  }
}
