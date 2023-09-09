import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { IonSelect } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
//import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { IRCVM } from '../../interfaces/view.model';
import { View } from '../../types/types';

//SwiperCore.use([Autoplay, Keyboard, Pagination, Scrollbar, Zoom]);

var sprintf = require('sprintf-js').sprintf;

@Component({
  selector: 'control-irc-view',
  templateUrl: 'control-irc.view.html',
  styleUrls: ['./control-irc.view.scss'],
})
export class ControlIRCView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;

  viewType = View;
  vm$: Observable<IRCVM>;

  private ircModesDefaults = [
    { id: 0, name: 'Automatic' },
    { id: 1, name: 'Automatic (currently heating)' },
    { id: 2, name: 'Automatic (currently cooling)' },
    { id: 3, name: 'Automatic heating' },
    { id: 4, name: 'Automatic cooling' },
    { id: 5, name: 'Manual heating' },
    { id: 6, name: 'Manual cooling' }
  ];

  private temperatureModesDefaults = [
    { id: 0, name: 'Economy', value: null },
    { id: 1, name: 'Comfort heating', value: null },
    { id: 2, name: 'Comfort cooling', value: null },
    { id: 3, name: 'Empty house', value: null },
    { id: 4, name: 'Heat protection', value: null },
    { id: 5, name: 'Increased heat', value: null },
    { id: 6, name: 'Party', value: null },
  //  { id: 7, name: 'Manual', value: null }
  ];

  selectTemperaturePreset = {
    header: this.translate.instant('Temperature preset'),
    cssClass: 'actionsheet'
  };

  selectOperatingMode = {
    header: this.translate.instant('Operating mode'),
    cssClass: 'actionsheet'
  };

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
      console.error('Control component not available for rendering.');
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

  private updateVM(control: Control, categories: Category[], rooms: Room[]): IRCVM {
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);

    let temperatureModes = [...this.temperatureModesDefaults];
    let ircModes = [...this.ircModesDefaults];

    let temp = ['',''];
    let mode = control.states.mode;
    let heatCoolId = ((mode == 1) || (mode == 3) || (mode == 5)) ? 1 : 2; // heating=id:1, cooling=id:2

    if (control.states.tempActual) {
      temp = sprintf("%.1f", control.states.tempActual).split('.');
      temp[1] = '.' + temp[1];
    }

    let isAbsoluteTemp = control.details.temperatures;

    temperatureModes.forEach( (item, index) => {
      if (isAbsoluteTemp[index] && !isAbsoluteTemp[index].isAbsolute) {
        let sign = -1;
        if (index == 5) sign = 1; // increased head should be addition
        item.value = Number(control.states.temperatures[heatCoolId]) + sign * Number(control.states.temperatures[index]);
      }
      else {
       item.value = Number(control.states.temperatures[index]);
      }
    })

    let ircModeId = null;

    if (control.states.mode) {
      ircModeId = ircModes.findIndex(item => { return item.id == control.states.mode });
    }

    let subControls = Object.keys(control.subControls);
    let state = null;

    if (control.subControls[subControls[0]].states.value) {
      state = control.subControls[subControls[0]].states.value; // TODO read states from both subControls?
    }

    let removeIdx = temperatureModes.findIndex( item => item.id === (3-heatCoolId) );
    temperatureModes.splice( removeIdx, 1 );
    let presetList = temperatureModes;
    let presentId = presetList.findIndex( item => item.id == state );

    const vm: IRCVM = {
      control: control,
      ui: {
        name: ircModeId ? ircModes[ircModeId].name : 'unknown',
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        tempTarget: control.states.tempTarget ? Number(control.states.tempTarget) : NaN, // TODO check
        tempActual: control.states.tempActual ? Number(control.states.tempActual) : NaN, // TODO check
        tempUnit: '°C', // TODO make configurable
        modeList: ircModes,
        mode: ircModeId,
        presetList: presetList,
        preset: presentId,
        icon: {
          tempBase: temp[0],
          tempDec: temp[1]
        },
        status: {
          text: state ? presetList[presentId].name : "unknown", // translate in scss to enable radio selection highlighting
          color: (presentId > 0) ? "#69c350" : "#9d9e9e" // TODO select from color palette
        }
      }
    };
    return vm;
  }

  setMode(vm, event) {
    console.log('Selected operating mode is', event.detail.value, vm);
  }

  setPreset(vm, event) {
    console.log('Selected preset is', event.detail.value, vm);
  }

}
