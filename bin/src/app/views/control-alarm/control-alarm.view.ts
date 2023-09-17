import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { AlarmVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';

@Component({
  selector: 'control-alarm-view',
  templateUrl: 'control-alarm.view.html',
  styleUrls: ['./control-alarm.view.scss'],
})
export class ControlAlarmView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<AlarmVM>;

  delayedon: boolean = false; // TODO store as App state
  presence: boolean = true;   // TODO store as App state

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
      console.error('Component \'control-alarm\' not available for rendering.');
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
    let text = armed ? 'Armed' : 'Disarmed';
    let bttnText = armed ? 'Disarm alarm' : 'Arm alarm';

    const vm: AlarmVM = {
      control: {
        ...control,
        icon: {
          href: 'assets/icons/svg/shield.svg',
          color: armed ? "primary" : "#9d9e9e" // TODO select from color palette
        }
      },
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        status: {
          text: this.translate.instant(text),
          color: armed ? "#69c350" /* primary */ : "#9d9e9e" // TODO select from color palette
        },
        button: {
          armedTxt: this.translate.instant(bttnText),
        },
        armed: armed,
      }
    };
    return vm;
  }

  armed(vm, event) {
    let cmd;

    if (!vm.ui.armed) { /* disarmed -> armed */
      if (this.delayedon) cmd = 'delayedon/';
        else cmd = 'on/';
      cmd += this.presence ? '1' : '0';
    }
    else { /* armed -> disarmed */
      cmd = 'off';
    }

    this.controlService.updateControl(vm.control, cmd);
  }

  presenceToggle(vm, event) {
    let cmd;
    if (vm.ui.armed) { /* only change presence detection when armed */
      cmd = 'dismv/' + (this.presence ? '1' : '0');
      this.controlService.updateControl(vm.control, cmd);
    }
  }

  showHistory(vm, event) {
  }
}
