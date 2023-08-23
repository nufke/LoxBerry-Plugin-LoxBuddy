import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { RadioVM, RadioListItem } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';

@Component({
  selector: 'control-radio-view',
  templateUrl: 'control-radio.view.html',
  styleUrls: ['./control-radio.view.scss'],
})
export class ControlRadioView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<RadioVM>;
  segment: string = 'moods';
  entries: RadioListItem[];
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
      console.error('Component \'control-radio\' not available for rendering.');
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
    let selectedId = Number(control.states.activeOutput);
    if (!selectedId) selectedId = 0;

    /* only update radioList if we have new entries, since it might cause GUI interruptions */
    if (this.entries !== control.details.outputs) {
      this.entries = control.details.outputs;
      this.radioList = [{ id: 0, name: control.details.allOff }]
        .concat(Object.entries(control.details.outputs).map(entry => ({ id: Number(entry[0]), name: String(entry[1]) })));
    }
    let idx = this.radioList.findIndex(item => { return item.id === selectedId });

    const vm: RadioVM = {
      control: control,
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        radioList: this.radioList,
        selectedId: selectedId,
        status: {
          text: String(this.radioList[idx].name),
          color: (selectedId > 0) ? "#69c350" : "#9d9e9e" // TODO select from color palette
        }
      }
    };
    return vm;
  }

  clickRadioButton(action: ButtonAction, vm: RadioVM, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    let min: number = 0;
    let max: number = vm.ui.radioList.length - 1;
    let idx: number = vm.ui.radioList.findIndex(item => { return item.id === vm.ui.selectedId });

    if (action === ButtonAction.PLUS) idx++;
    else idx--;

    if (idx > max) {
      idx = min;
    }
    else {
      if (idx < min) {
        idx = max;
      }
    }

    vm.ui.selectedId = vm.ui.radioList[idx].id;

    let msg = String(vm.ui.radioList[idx].id);
    if (msg === "0") msg = "reset"; // loxone requires text "reset" instead of ID

    this.controlService.updateControl(vm.control, msg);
  }

}
