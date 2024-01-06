import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { RadioVM, RadioListItem } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'control-switch-view',
  templateUrl: 'control-switch.view.html',
  styleUrls: ['./control-switch.view.scss'],
})
export class ControlSwitchView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<RadioVM>;
  radioList: RadioListItem[];

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
      console.error('Component \'control-switch\' not available for rendering.');
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

  private updateVM(control: Control, categories: Category[], rooms: Room[]): RadioVM {
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);
    let switchstate = (control.states.active === "1");

    /* only update radioList if we have new entries, since it might cause GUI interruptions */
    if (!this.radioList) {
      this.radioList = [
        { id: 0, name: this.translate.instant('Off')},
        { id: 1, name: this.translate.instant('On')}
      ];
    }

    const vm: RadioVM = {
      control: {
        ...control,
        icon: {
          href: control.icon.href,
          color: switchstate ? 'primary' : 'dark'
        }
      },
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : 'unknown',
        category: (category && category.name) ? category.name : 'unknown',
        radioList: this.radioList,
        selectedId: switchstate ? 1 : 0,
        status: {
          text: switchstate ? this.translate.instant('On') : this.translate.instant('Off'),
          color: switchstate ? Utils.getColor('primary') : Utils.getColor('secondary'),
        },
        toggle: switchstate,
      }
    };
    return vm;
  }

  clickToggle(vm: RadioVM, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    if (vm.ui.toggle) {
      this.controlService.updateControl(vm.control, 'Off');
    }
    else {
      this.controlService.updateControl(vm.control, 'On');
    }
  }

  radioChange(vm: RadioVM, $event) {
    $event.preventDefault();
    $event.stopPropagation();
    let idx = vm.ui.radioList.findIndex( item => item.name === $event.detail.value);
    if (idx) {
      this.controlService.updateControl(vm.control, 'On');
    }
    else {
      this.controlService.updateControl(vm.control, 'Off');
    }
  }

}
