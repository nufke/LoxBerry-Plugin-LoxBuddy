import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, SubControl } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { ColorPickerVM } from '../../interfaces/view.model';
import { View } from '../../types/types';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'control-color-picker-v2.view',
  templateUrl: 'control-color-picker-v2.view.html',
  styleUrls: ['./control-color-picker-v2.view.scss'],
})
export class ControlColorPickerV2View
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() subControl: SubControl;
  @Input() view: View;

  vm$: Observable<ColorPickerVM>;
  segment: string = 'color';
  mode_rgb: Boolean;

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
    this.mode_rgb = true;
  }

  ngOnInit(): void {
    this.initVM();
  }

  ngOnDestroy(): void {
  }

  private initVM(): void {
    if ((this.subControl == undefined)||(this.control == undefined)) {
      console.error('Component \'control-color-picker-v2\' not available for rendering.');
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

  private updateVM(control: Control, subControl: SubControl): ColorPickerVM {
    let hsv = subControl.states.color.match(/hsv\(([0-9]*),([0-9]*),([0-9]*)\)/);
    let rgb = Utils.hsv2rgb(Number(hsv[1]), Number(hsv[2]), 100); // use maximum luninance (100%)
    const vm: ColorPickerVM = {
      control: control,
      subControl: subControl,
      rgb: {r: rgb[0], g: rgb[1], b: rgb[2]},
      position: Number(hsv[3]),
    };
    return vm;
  }

  updateSegment() {
    // Close any open sliding items when the schedule updates
  }

  toggleMode() {
    this.mode_rgb = !this.mode_rgb;
  }

}
