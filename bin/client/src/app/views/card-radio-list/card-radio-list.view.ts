import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { RadioVM } from '../../interfaces/view.model';

@Component({
  selector: 'card-radio-list-view',
  templateUrl: 'card-radio-list.view.html',
  styleUrls: ['./card-radio-list.view.scss'],
})
export class CardRadioListView {

  @Input() radio_vm: RadioVM;

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

  radioGroupChange(vm: RadioVM, $event) {
    if (vm.control.type === 'Radio') {
      let idx = vm.ui.radioList.findIndex( item => item.name === $event.detail.value);

      /* only send update if mood exists and selected_id is different */
      if (vm.ui.radioList[idx] && vm.ui.radioList[idx].id != vm.ui.selectedId ) {
        let msg = String(vm.ui.radioList[idx].id);
        if (msg === "0") msg = "reset"; /* Loxone requires reset instead of ID */
        this.controlService.updateControl(vm.control, msg);
      }
    }

    if (vm.control.type === 'LightControllerV2') {
      let idx = vm.ui.radioList.findIndex( item => item.name === $event.detail.value);

      /* only send update if mood exists and selected_id is different */
      if (vm.ui.radioList[idx] && vm.ui.radioList[idx].id != vm.ui.selectedId ) {
        let msg = 'changeTo/' + String(vm.ui.radioList[idx].id);
        this.controlService.updateControl(vm.control, msg);
      }
    }

    if (vm.control.type === 'IRoomController') {
      //TODO
    }
  }

}
