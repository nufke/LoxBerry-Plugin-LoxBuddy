import { Component, OnInit, Input } from '@angular/core';
import iro from "@jaames/iro";
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { ColorPickerVM } from '../../interfaces/view.model';

@Component({
  selector: 'element-color-temp-picker-view',
  templateUrl: 'element-color-temp-picker.view.html',
  styleUrls: ['./element-color-temp-picker.view.scss'],
})
export class ElementColorTempPickerView
  implements OnInit {

  @Input() color_picker_vm: ColorPickerVM;

  TempPicker; // TODO add type

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

  ngOnChanges() {
    if (this.TempPicker)
      this.TempPicker.color.set(this.color_picker_vm.rgb);
  }

  ngOnInit() {
    this.TempPicker = iro.ColorPicker(".picker",
    {
      width: 280,
      borderWidth: 8,
      borderColor: "#232425", // same as card
      handleRadius: 10,
      layoutDirection: 'horizontal',
      layout: [ {
        component: iro.ui.Slider,
        options: {
          sliderShape: 'circle',
          sliderType: 'kelvin',
        }
      } ]
    });
    this.TempPicker.on('color:change', (color) => { this.updateColor(color) });
  }

  updateColor(color) {
    let hsv_color = 'hsv(' + Math.round(color.hsv.h) + ',' + Math.round(color.hsv.s) + ',' + this.color_picker_vm.position + ')';
    this.controlService.updateControl(this.color_picker_vm.subControl, hsv_color);
  }

}
