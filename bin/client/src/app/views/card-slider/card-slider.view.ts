import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { SliderVM } from '../../interfaces/view.model';
import { ButtonAction } from '../../types/types';

@Component({
  selector: 'card-slider-view',
  templateUrl: 'card-slider.view.html',
  styleUrls: ['./card-slider.view.scss'],
})
export class CardSliderView {

  @Input() slider_vm: SliderVM;

  buttonType = ButtonAction;

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

  sliderChange(vm: SliderVM, $event) {
    if (vm.control.states.value != $event.detail.value) {
      this.controlService.updateControl(vm.control, String($event.detail.value));
    }
  }

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
