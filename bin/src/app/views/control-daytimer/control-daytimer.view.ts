import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { DatePipe } from '@angular/common';
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { DaytimerVM } from '../../interfaces/view.model';
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
  vm$: Observable<DaytimerVM>;

  output: boolean;

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

  stopTimerText = this.translate.instant('Stop timer');

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

  ngOnInit(): void {
    this.initVM();
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

  private updateVM(control: Control, categories: Category[], rooms: Room[]): DaytimerVM {
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);
    let active = (Number(control.states.value) || (control.details.analog));
    
    let currentTime = moment({
      h: new Date().getHours(),
      s: new Date().getMinutes()
    });
    
    let endTime = '00:00';
    let startTime = '00:00';

    if (control.states.entriesAndDefaultValue) {
      let jsonStr = control.states.entriesAndDefaultValue;
      jsonStr = jsonStr.replaceAll('}\n{', '},\n{');                  // fix array
      jsonStr = jsonStr.replace(/([a-zA-Z]+)(: )/gm, '"$1"$2');       // key as string
      jsonStr = jsonStr.replace(/(: )([a-zA-Z\-\d:]+)/gm, ': "$2"');  // value as string

      let json = JSON.parse(jsonStr);
      if (Number(json.entries) > 0) {
        let modes = json.entry.filter(item => item.mode === control.states.mode);

        for (let i = 0; i < modes.length; i++) {
          let item = modes[i];
          if (currentTime.isAfter(moment(item.to, 'HH:mm'))) {
            startTime = item.to;
          }

          if (currentTime.isBefore(moment(item.from, 'HH:mm'))) {
            endTime = item.from;
          }

          if (currentTime.isAfter(moment(item.from, 'HH:mm')) && currentTime.isBefore(moment(item.to, 'HH:mm')) ) {
            startTime = item.from;
            endTime = item.to;
            break; // result found, quit loop
          }
        };
      }
    }
    
    let override : boolean = (Number(control.states.override) > 0);
    let text = Boolean(control.details.analog) ? sprintf(control.details.format, control.states.value) : (Number(control.states.value) ? control.details.text.on : control.details.text.off);

    let datePipe = new DatePipe('en-US');
    const end = Date.now() + Number(control.states.override)*1000;
    let dateStr = datePipe.transform(end,"dd.MM.yyyy HH:mm");
    if (override) {
      text += ' ' + this.translate.instant('Till').toLowerCase() + ' ' + dateStr;
    } else {
      if (startTime !== endTime) {
        text += ' ' + this.translate.instant('From').toLowerCase() + ' ' + startTime + ' ' + this.translate.instant('Till').toLowerCase() + ' ' + endTime;
      }
    }

    if (this.output==undefined) this.output = !active; // only assign once

    const vm: DaytimerVM = {
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
          text: text,
          color: active ? Utils.getColor('primary') : Utils.getColor('secondary')
        },
        timer: {
          enabled: override,
          endTime: Number(control.states.override),
          text: override ? "Stop timer" : "Start timer"
        },
        calendar: {
          output: this.output,
          datetime: undefined,
          locale: this.translate.currentLang
        }
      }
    };
    return vm;
  }

  cancelTimer($event, vm) {
    if ($event.detail.role === 'ok') {

      this.controlService.updateControl(vm.control, 'stopOverride');
    }
  }

  cancel() {
    this.datetime.cancel(true);
  }

  dateChanged($event, vm) {
    vm.ui.calendar.datetime = $event.detail.value;
    var coeff = 1000 * 60; // round to minute
    let overrideTimeSec = Math.round((new Date(vm.ui.calendar.datetime).getTime() - Date.now())/coeff)*coeff/1000;
    let overrideValue = vm.ui.calendar.output ? '1' : '0';
    let setTimer = (overrideTimeSec > 10); // TODO define minimum time
    if (!setTimer) {
      vm.calendar.datetime  = undefined;
      return;
    }
    let cmd = 'startOverride/' + String(overrideValue) + '/' + String(overrideTimeSec)
    this.controlService.updateControl(vm.control, cmd);
  }

  confirm() {
    this.datetime.confirm(true);
  }

}
