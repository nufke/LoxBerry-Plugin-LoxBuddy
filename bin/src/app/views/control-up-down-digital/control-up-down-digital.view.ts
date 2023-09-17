import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { TextVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';

@Component({
  selector: 'control-up-down-digital-view',
  templateUrl: 'control-up-down-digital.view.html',
  styleUrls: ['./control-up-down-digital.view.scss'],
})
export class ControlUpDownDigitalView
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
      console.error('Component \'control-up-down-digital\' not available for rendering.');
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

    const vm: TextVM = {
      control: control,
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        status: {
          text: '',
          color: "#9d9e9e" // TODO select from color palette
        }
      }
    };
    return vm;
  }

  clickButton(action: ButtonAction, vm: TextVM, $event) {
    $event.preventDefault();
    $event.stopPropagation();
    switch (action) {
      case ButtonAction.UP:
        this.controlService.updateControl(vm.control, 'PulseUp');
        break;
      case ButtonAction.DOWN:
        this.controlService.updateControl(vm.control, 'PulseDown');
        break;
      default: /* none */
    }
  }

}
