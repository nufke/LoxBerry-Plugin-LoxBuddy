import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { Control, SubControl } from '../../interfaces/data.model';
import { DimmerVM } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'card-dimmer-view',
  templateUrl: 'card-dimmer.view.html',
  styleUrls: ['./card-dimmer.view.scss'],
})
export class CardDimmerView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() subControl: SubControl;
  @Input() view: View;

  vm$: Observable<DimmerVM>;
  buttonType = ButtonAction;
  viewType = View;

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
    if ((this.subControl == undefined) || (this.control == undefined)) {
      console.error('Component \'card-dimmer\' not available for rendering.');
      return;
    }

    this.vm$ = combineLatest([
      this.controlService.getControl$(this.control.serialNr, this.control.uuid),
      this.controlService.getSubControl$(this.control.serialNr, this.control.uuid, this.subControl.uuid),
    ]).pipe(
      map(([control, subControl]) => {
        return this.updateVM(control, subControl);
      })
    );
  }

  private updateVM(control: Control, subControl: SubControl): DimmerVM {
    // not all dimmer controls define the limits, instead use some defaults
    let min = (subControl.states.min == undefined || subControl.states.min === '') ? 0 : Number(subControl.states.min);
    let max = (subControl.states.max == undefined || subControl.states.max === '') ? 100 : Number(subControl.states.max);
    let step = (subControl.states.step == undefined || subControl.states.step === '') ? 1 : Number(subControl.states.step);

    let position: number = 0;
    let slider_color: string = '';
    let button_color: string = '';
    let rgb: number[] = [];

    if (subControl.type === 'Dimmer') {
      position = subControl.states.position ? Number(subControl.states.position): 0;
      slider_color = '-webkit-linear-gradient(left, rgba(49,56,62, 1), rgb(255, 229, 127))';
      button_color = 'rgba(255, 229, 127,' + (position / 100) + ')';
    }

    if (subControl.type === 'ColorPickerV2') {
      let hsv = subControl.states.color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
      if (hsv) {
        position = hsv[3] ? Number(hsv[3]) : 0;
        let rgb = Utils.hsv2rgb(Number(hsv[1]), Number(hsv[2]), 100);
        slider_color = '-webkit-linear-gradient(left, rgba(49,56,62, 1), rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + '))';
        button_color = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (position / 100) + ')';
      }
    }

    const vm: DimmerVM = {
      control: control,
      subControl: subControl,
      ui: {
        name: (this.view === View.DETAILED) ? subControl.name : this.translate.instant('Brightness'),
        buttonColor: (position < 10) ? '#31373e' : button_color, // TODO update for white template
        slider: {
          position: position,
          min: min,
          max: max,
          step: step,
          color: slider_color,
        },
      },
      rgb: rgb,
    };
    return vm;
  }

  sliderChange(vm: DimmerVM, $event) {
    if (vm.subControl.type === 'Dimmer') {
      if (vm.subControl.states.position != $event.detail.value) {
        this.controlService.updateControl(vm.subControl, String($event.detail.value));
      }
    }

    if (vm.subControl.type === 'ColorPickerV2') {
      let hsv = vm.subControl.states.color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
      if (hsv[3] != $event.detail.value) {
        let color = 'hsv(' + hsv[1] + ',' + hsv[2] + ',' + String($event.detail.value) + ')';
        this.controlService.updateControl(vm.subControl, color);
      }
    }
  }

  clickDimmerButton(action: ButtonAction, vm: DimmerVM, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    let position: number;

    if (action === ButtonAction.UP) {
      position = vm.ui.slider.position + vm.ui.slider.step;
    }
    else {
      position = vm.ui.slider.position - vm.ui.slider.step;
    }

    if (position < vm.ui.slider.min) position = vm.ui.slider.min;
    if (position > vm.ui.slider.max) position = vm.ui.slider.max;

    if (vm.subControl.type === 'Dimmer') {
      this.controlService.updateControl(vm.subControl, String(position));
    }

    if (vm.subControl.type === 'ColorPickerV2') {
      let hsv = vm.subControl.states.color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
      let color = 'hsv(' + hsv[1] + ',' + hsv[2] + ',' + String(position) + ')';
      this.controlService.updateControl(vm.subControl, color);
    }
  }

}
