import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { TextVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';

var sprintf = require('sprintf-js').sprintf;

@Component({
  selector: 'control-jalousie-view',
  templateUrl: 'control-jalousie.view.html',
  styleUrls: ['./control-jalousie.view.scss'],
})
export class ControlJalousieView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<TextVM>;

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
      console.error('Component \'control-jalousie\' not available for rendering.');
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

    let position = control.states.position * 100;
    let text = sprintf("%1.0f%% ", position) + this.translate.instant('Closed').toLowerCase();
    if (position < 1) text = this.translate.instant('Opened');
    if (position > 99) text = this.translate.instant('Closed');

    const vm: TextVM = {
      control: {
        ...control,
        icon: {
          href: control.icon.href,
          color: (position > 0) ? "primary" : "#9d9e9e" // TODO select from color palette
        }
      },
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        status: {
          text: text,
          color: (position > 0) ? "#69c350" /* primary */ : "#9d9e9e" // TODO select from color palette
        }
      }
    };
    return vm;
  }

  clickButton(action: ButtonAction, vm: TextVM, $event) {
    if ($event) { /* only prevent in list and favs */
      $event.preventDefault();
      $event.stopPropagation();
    }
    switch (action) {
      case ButtonAction.UP:
        this.controlService.updateControl(vm.control, 'up');
        break;
      case ButtonAction.UP_OFF:
          this.controlService.updateControl(vm.control, 'UpOff');
        break;
      case ButtonAction.DOWN:
        this.controlService.updateControl(vm.control, 'down');
        break;
      case ButtonAction.DOWN_OFF:
          this.controlService.updateControl(vm.control, 'DownOff');
          break;
      case ButtonAction.FULL_OPEN:
        this.controlService.updateControl(vm.control, 'FullUp');
        break;
      case ButtonAction.FULL_CLOSE:
        this.controlService.updateControl(vm.control, 'FullDown');
        break;
      case ButtonAction.SHADE:
        this.controlService.updateControl(vm.control, 'shade');
        break;
      default: /* none */
    }
  }
}
