import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { AlarmVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'control-smokealarm-view',
  templateUrl: 'control-smokealarm.view.html',
  styleUrls: ['./control-smokealarm.view.scss'],
})
export class ControlSmokeAlarmView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<AlarmVM>;

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

  serviceMode = false; //TODO

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
    let armed = Number(control.states.armed) ? true : false;
    let text = '';
    let color_text = Utils.getColor('primary'); // default color
    let color_icon = 'primary'; // default color

    let service = this.serviceMode ? 'Stop alarm suppression' : 'Start alarm suppression';

    switch (Number(control.states.level)) {
      case 0: 
        text = 'Everything OK'; 
        console.log('ok');
        break;
      case 1: 
        text = 'Pre-alarm active'; 
        color_text = Utils.getColor('danger');
        color_icon = 'danger';
        break;
      case 2: 
        text = 'Main alarm active'; 
        color_text = Utils.getColor('danger');
        color_icon = 'danger';
        break;
    }

    const vm: AlarmVM = {
      control: {
        ...control,
        icon: {
          href: 'assets/icons/svg/flame-sharp.svg',
          color: color_icon
        }
      },
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        status: {
          text: this.translate.instant(text),
          color: color_text
        },
        button: {
          text: this.translate.instant(service),
        },
        armed: armed,
      }
    };
    return vm;
  }

  service(vm, event) {
  }

  showHistory(vm, event) {
  }
}
