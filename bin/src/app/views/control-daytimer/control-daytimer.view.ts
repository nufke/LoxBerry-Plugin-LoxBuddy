import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { TextVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';
import { Utils } from '../../utils/utils';
import * as moment from 'moment';

var sprintf = require('sprintf-js').sprintf;

@Component({
  selector: 'control-daytimer-view',
  templateUrl: 'control-daytimer.view.html',
  styleUrls: ['./control-daytimer.view.scss'],
})
export class ControlDaytimerView
  implements OnInit, OnDestroy {
  @ViewChild(IonDatetime, { static: false }) datetime: IonDatetime;

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<TextVM>;

  delayedon: boolean = false; // TODO store as App state
  presence: boolean = true;   // TODO store as App state

  dateTimer: string;
  timerSet: boolean;
  timerButtonlabel: string;
  overrideValue: boolean;

  cancelTimerButtons = [
    {
      text:  this.translate.instant('Cancel'),
      role: 'cancel'
    },
    {
      text: 'OK',
      role: 'ok'
    },
  ];

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {

    this.overrideValue = true;
  }

  ngOnInit(): void {
    this.initVM();
    this.timerSet = this.dateTimer ? new Date(this.dateTimer).getTime() > Date.now() : false;
    this.timerButtonlabel = this.timerSet ? "Stop timer" : "Start timer";
  }

  ngOnDestroy(): void {
  }

  private initVM(): void {
    if (this.control == undefined) {
      console.error('Component \'control-daytimer\' not available for rendering.');
      return;
    }

    this.vm$ = combineLatest([
      this.controlService.getControl$(this.control.serialNr, this.control.uuid),
      this.controlService.categories$,
      this.controlService.rooms$,
    ]).pipe(
      map(([control, categories, rooms]) => {
        return this.updateVM(control, categories, rooms);
      })
    );
  }

  private updateVM(control: Control, categories: Category[], rooms: Room[]): TextVM {
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);

    let active = (Number(control.states.value) || (control.details.analog));

    const vm: TextVM = {
      control: {
        ...control,
        icon: {
          href: control.icon.href,
          color: active ? "primary" : Utils.getColor('dark')
        }
      },
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : 'unknown',
        category: (category && category.name) ? category.name : 'unknown',
        status: {
          text: Boolean(control.details.analog) ? sprintf(control.details.format, control.states.value) : (Number(control.states.value) ? control.details.text.on : control.details.text.off),
          color: active ? Utils.getColor('primary') : Utils.getColor('secondary')
        }
      }
    };
    return vm;
  }

  cancelTimer($event, vm) {
    if ($event.detail.role === 'ok') {
      this.timerSet = false;
      this.dateTimer = moment().toISOString(true);
      this.timerButtonlabel = "Start timer";
      //this.controlService.updateControl(vm.control, 'stopOverride');
    }
  }

  clickToggle($event) {
  }

  cancel() {
    this.datetime.cancel(true);
    this.dateTimer = moment().toISOString(true);
  }

  dateChanged($event) {
    this.dateTimer = $event.detail.value;
    let overrideTimeSec = Math.floor((new Date(this.dateTimer).getTime() - Date.now())/1000);
    console.log('overrideTimeSec', overrideTimeSec);
    this.timerSet = this.dateTimer ? (overrideTimeSec > 10) : false; // TODO define minimum time
    this.timerButtonlabel = this.timerSet ? "Stop timer" : "Start timer";
    if (!this.timerSet) this.dateTimer = moment().toISOString(true);

    //if (!this.timerSet)
    //this.controlService.updateControl(vm.control, 'stopOverride');
    //let cmd 'startOverride/' + String(overrideTimeSec) /{howLongInSecs}
  }

  confirm() {
    this.datetime.confirm(true);
  }

}
