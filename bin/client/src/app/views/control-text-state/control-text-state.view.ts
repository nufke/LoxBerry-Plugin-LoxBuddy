import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { TextVM } from '../../interfaces/view.model';
import { View } from '../../types/types';
import { Utils } from '../../utils/utils';
import * as moment from 'moment';

var sprintf = require('sprintf-js').sprintf;

interface Status {
  text: string;
  color: string;
}

@Component({
  selector: 'control-text-state-view',
  templateUrl: 'control-text-state.view.html',
  styleUrls: ['./control-text-state.view.scss'],
})
export class ControlTextStateView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

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
      console.error('Component \'control-text-state\' not available for rendering.');
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
    if (!control) return;
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);
    let status : Status = this.processControl(control);

    const vm: TextVM = {
      control: control,
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : 'unknown',
        category: (category && category.name) ? category.name : 'unknown',
        status: {
          text: status.text,
          color: status.color,
        }
      }
    };
    return vm;
  }

  processControl(control: Control): Status {
    const loxTimeRef = 1230764400000; // correction to epoch, Loxone calculates from 1-1-2009
    let s: Status = {
      text: '',
      color: Utils.getColor('secundary')
    };
    switch (control.type) {
      case 'InfoOnlyText':
        s.text = control.states.text ? sprintf(control.details.format, control.states.text) : '';
        break;
      case 'InfoOnlyDigital':
        let active = (control.states.active === "1");
        s.text = active ? control.details.text.on : control.details.text.off;
        s.color = active ? control.details.color.on : control.details.color.off;
        break;
      case 'TextState':
        s.text = control.states.textAndIcon ? control.states.textAndIcon : ''; // TODO iconAndColor?
        break;
      case 'InfoOnlyAnalog':
        switch (control.details.format) {
          case '<v.u>': // date + time
            let date = new Date(Number(control.states.value) * 1000 + loxTimeRef); 
            s.text = moment(date).locale(this.translate.currentLang).format('LLL');
            break;
          case '<v.t>': // duration/time
            let du = Number(control.states.value) / 60;
            let days = Math.floor(du / 1440);
            let hours = Math.floor((du % 1440) / 60);
            let minutes = Math.floor((du % 1440) % 60);
            s.text = days + 'd ' + hours + 'h ' + minutes + 'm';
            break;
          case '<v.d>': // EIS4, dd:mm:yyyy
            let d = new Date(Number(control.states.value) * 1000 + loxTimeRef);
            s.text = moment(d).locale(this.translate.currentLang).format('LL');
            break;
          case '<v.x>': // digital value
            s.text = control.states.value ? '1' : '0'; // TODO check
            break;
          case '<v.j>': // combined value
            control.details.format = '%f'; // TODO: check
          case '<v.i>': // combined Pushbutton
            control.details.format = '%f'; // TODO: check
          case '<v.c>': // color
            control.details.format = '#%6h'; // TODO: check
          case '<v.m>': // EIS3, hh:mm:ss
            control.details.format = '%d'; // TODO: check
          case '<v>': // integer
            control.details.format = '%d';
          case '<v.1>': // float in x.y notation
            control.details.format = '%.1f';
          case '<v.2>': // float in x.yy notation
            control.details.format = '%.2f';
          case '<v.3>': // float in x.yy notation
            control.details.format = '%.3f';
          default:
            if (control.states.value && control.details.format) {
              s.text = sprintf(control.details.format, control.states.value);
            } // else empty string
            break;
        }
        break;
      default:
        break; // empty string
    }
    return s;
  }

}
