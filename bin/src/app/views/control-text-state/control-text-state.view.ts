import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { TextVM } from '../../interfaces/view.model';
import { View } from '../../types/types';
import * as moment from 'moment';

var sprintf = require('sprintf-js').sprintf;

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
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);

    const vm: TextVM = {
      control: control,
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        status: {
          text: this.processText(control),
          color: this.processColor(control),
        }
      }
    };
    return vm;
  }

  processText(control: Control): string {
    let text: string;
    switch (control.type) {
      case 'InfoOnlyText':
        text = control.states.text ? sprintf(control.details.format, control.states.text) : '';
        break;
      case 'InfoOnlyDigital':
        let active = (control.states.active === "1");
        text = active ? control.details.text.on : control.details.text.off;
        break;
      case 'TextState':
        text = control.states.textAndIcon ? control.states.textAndIcon : ''; // TODO iconAndColor?
        break;
      case 'InfoOnlyAnalog':
        switch (control.details.format) {
          case '<v.u>': // date + time
            let date = new Date(Number(control.states.value) * 1000 + 1230768000000);
            text = moment(date).format("DD-MM-YYYY HH:MM").toString(); // TODO European (24) vs US (am/pm) setting
            break;
          case '<v.t>': // duration/time
            let du = Number(control.states.value) / 60;
            let days = Math.floor(du / 1440);
            let hours = Math.floor((du % 1440) / 60);
            let minutes = Math.floor((du % 1440) % 60);
            text = days + 'd ' + hours + 'h ' + minutes + 'm'; //
            break;
          case '<v.d>': // EIS4, dd:mm:yyyy
            let d = new Date(Number(control.states.value) * 1000 + 1230768000000); // TODO check
            text = moment(d).format("DD:MM:YYYY").toString();
            break;
          case '<v.x>': // digital value
            text = control.states.value ? '1' : '0'; // TODO check
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
            if (control.states.value && control.details.format)
              text = sprintf(control.details.format, control.states.value);
            else text = '';
            break;
        }
        break;
      default:
        text = ''; // Empty
    }
    return text;
  }

  processColor(control: Control): string {
    let color: string;
    switch (control.type) {
      case 'InfoOnlyDigital':
        let active = (control.states.active === "1");
        color = active ? control.details.color.on : control.details.color.off;
        break;
      default:
        color = "#9d9e9e"; // TODO select from color palette
    }
    return color;
  }

}
