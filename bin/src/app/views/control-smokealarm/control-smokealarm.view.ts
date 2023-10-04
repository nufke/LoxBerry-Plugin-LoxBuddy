import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonDatetime } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { AlarmVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';
import { Utils } from '../../utils/utils';
import * as moment from 'moment';

@Component({
  selector: 'control-smokealarm-view',
  templateUrl: 'control-smokealarm.view.html',
  styleUrls: ['./control-smokealarm.view.scss'],
})
export class ControlSmokeAlarmView
  implements OnInit, OnDestroy {
  @ViewChild(IonDatetime, { static: false }) datetime: IonDatetime;

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<AlarmVM>;

  cancelButtons = [
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
  }

  servicetime;

  ngOnInit(): void {
    this.initVM();
  }

  ngOnDestroy(): void {
  }

  private initVM(): void {
    if (this.control == undefined) {
      console.error('Component \'control-smokealarm\' not available for rendering.');
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

  private updateVM(control: Control, categories: Category[], rooms: Room[]): AlarmVM {
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);
    let text = '';
    let serviceDuration = '';
    let color = 'primary'; // default color
    let serviceMode = (Number(control.states.timeServiceMode) > 0);
    let serviceText = serviceMode ? 'Stop alarm suppression' : 'Start alarm suppression';
    let level = Number(control.states.level);
    
    if (serviceMode) level = 99; // overrule when in service mode

    switch (level) {
      case 0: 
        text = 'Everything OK'; 
        break;
      case 1: 
        text = 'Pre-alarm active'; 
        color = 'danger';
        break;
      case 2: 
        text = 'Main alarm active'; 
        color = 'danger';
        break;
      case 99: // service
        text = 'Alarm suppression enabled';
        serviceDuration = ' (' + control.states.timeServiceMode + 's)';  
        color = 'warning';
        break;
      default: 
        text = 'Unknown state';
        color = 'secondary';
    }

    const vm: AlarmVM = {
      control: {
        ...control,
        icon: {
          href: 'assets/icons/svg/flame-sharp.svg',
          color: color
        }
      },
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        status: {
          text: this.translate.instant(text) + serviceDuration,
          color: Utils.getColor(color)
        },
        button: {
          text: this.translate.instant(serviceText),
        }
      },
      state: serviceMode,
    };
    return vm;
  }

  timeChanged($event, vm) {
    this.servicetime = $event.detail.value;
    let serviceSec = Math.round((new Date(this.servicetime).getTime() - Date.now())/1000);
    console.log('serviceSec', serviceSec);
    
    if (serviceSec>1) {
      let cmd = 'servicemode/' + String(serviceSec);
      this.controlService.updateControl(vm.control, cmd);
    }
  }

  cancel() {
    this.datetime.cancel(true);
  }

  cancelService($event, vm) {
    if ($event.detail.role === 'ok') {
      this.controlService.updateControl(vm.control, 'servicemode/0');
    }
  }

  confirm() {
    this.datetime.confirm(true);
  }

  service(vm, event) {
  }

  showHistory(vm, event) {
  }
}
