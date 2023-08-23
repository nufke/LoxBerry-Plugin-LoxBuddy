import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { TextVM } from '../../interfaces/view.model';

@Component({
  selector: 'card-text-view',
  templateUrl: 'card-text.view.html',
  styleUrls: ['./card-text.view.scss'],
})
export class CardTextView {

  @Input() text_vm: TextVM;

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

}
