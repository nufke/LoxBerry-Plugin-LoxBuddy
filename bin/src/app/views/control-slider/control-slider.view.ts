import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { SliderVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';

var sprintf = require('sprintf-js').sprintf;

@Component({
  selector: 'control-slider-view',
  templateUrl: 'control-slider.view.html',
  styleUrls: ['./control-slider.view.scss'],
})
export class ControlSliderView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<SliderVM>;

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
      console.error('Component \'control-slider\' not available for rendering.');
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

  private updateVM(control: Control, categories: Category[], rooms: Room[]): SliderVM {
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);
    let text = '';
    let position = 0;

    if (control.states.value && control.details.format)
      text = sprintf(control.details.format, control.states.value);

    if (control.states.value)
      position = Number(control.states.value)

    const vm: SliderVM = {
      control: control,
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        slider: { position: position },
        status: {
          text: text,
          color: "#9d9e9e" // TODO select from color palette
        }
      }
    };
    return vm;
  }

  // TODO reuse card-slider-view?
  clickSliderButton(action: ButtonAction, vm: SliderVM, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    let min = Number(vm.control.details.min);
    let max = Number(vm.control.details.max);
    let step = Number(vm.control.details.step);
    let position: number;

    if (action === ButtonAction.PLUS) {
      position = vm.ui.slider.position + step;
    }
    else {
      position = vm.ui.slider.position - step;
    }

    if (position < min) position = min;
    if (position > max) position = max;

    this.controlService.updateControl(vm.control, String(position));
  }

}
