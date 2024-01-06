import { Component, OnInit, Input } from '@angular/core';
import iro from "@jaames/iro";
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { ColorPickerVM } from '../../interfaces/view.model';

@Component({
  selector: 'element-color-rgb-picker-view',
  templateUrl: 'element-color-rgb-picker.view.html',
  styleUrls: ['./element-color-rgb-picker.view.scss'],
})
export class ElementColorRGBPickerView
  implements OnInit {

  @Input() color_picker_vm: ColorPickerVM;

  ColorPicker; // TODO add type

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

  ngOnChanges(): void {
    if (this.ColorPicker)
      this.ColorPicker.color.set(this.color_picker_vm.rgb);
  }

  ngOnInit(): void {
    this.ColorPicker = iro.ColorPicker(".picker",
    {
      width: 280,
      color: this.color_picker_vm.rgb,
      borderWidth: 8,
      borderColor: "#232425", // same as card
      handleRadius: 10,
      layout: [ { component: iro.ui.Wheel, } ]
    });
    this.ColorPicker.on('color:change', (color) => { this.updateColor(color) });
  }

  updateColor(color) {
    let hsv_color = 'hsv(' + Math.round(color.hsv.h) + ',' + Math.round(color.hsv.s) + ',' + this.color_picker_vm.position + ')';
    this.controlService.updateControl(this.color_picker_vm.subControl, hsv_color);
  }

}
