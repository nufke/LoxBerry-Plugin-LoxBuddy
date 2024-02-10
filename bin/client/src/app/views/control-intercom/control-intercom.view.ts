import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
  selector: 'control-intercom-view',
  templateUrl: 'control-intercom.view.html',
  styleUrls: ['./control-intercom.view.scss'],
})
export class ControlIntercomView
  implements OnInit, OnDestroy {

  //@ViewChild('embedVideo') embedVideo: ElementRef<HTMLVideoElement>;

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  viewType = View;
  vm$: Observable<TextVM>;

  videoSrc;

  constructor(
    public translate: TranslateService,
    public controlService: ControlService) {
  }

  ngOnInit(): void {
    this.initVM();
    this.videoSrc='https://192.168.1.200:4001/video.cgi';
  }

  ngOnDestroy(): void {
  }

  private initVM(): void {
    if (this.control == undefined) {
      console.error('Component \'control-intercom\' not available for rendering.');
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

    //console.log('bell', control.states.bell);
    //console.log('lastBellEvents', control.states.lastBellEvents);
    //console.log('lastBellTimestamp', control.states.lastBellTimestamp);
    //console.log('control.securedDetails', control.securedDetails);
    //'jdev/sps/io/'{controlUUID}/securedDetails

    const vm: TextVM = {
      control: control,
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : 'unknown',
        category: (category && category.name) ? category.name : 'unknown',
        status: {
          text: 'Intercom',
          color: Utils.getColor('primary')
        }
      }
    };
    return vm;
  }

}
