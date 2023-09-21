import { Component, ViewChild, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
//import SwiperCore, { Autoplay, Keyboard, Pagination, Scrollbar, Zoom } from 'swiper';
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { IRCVM } from '../../interfaces/view.model';
import { View } from '../../types/types';
import { Utils } from '../../utils/utils';

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
  @Input() key: string;

  viewType = View;
  vm$: Observable<IRCVM>;

  private ircModesDefaults = [
    { id: 0, name: 'Automatic', show: true },
    { id: 1, name: 'Automatic (currently heating)', show: false },
    { id: 2, name: 'Automatic (currently cooling)', show: false },
    { id: 3, name: 'Automatic heating', show: true },
    { id: 4, name: 'Automatic cooling', show: true },
    { id: 5, name: 'Manual heating', show: true },
    { id: 6, name: 'Manual cooling', show: true }
  ];

  private temperatureModesDefaults = [
    { id: 0, name: 'Economy', value: null, abs: null, corr: 1, show: true },
    { id: 1, name: 'Comfort heating', value: null, abs: null, corr: 0, show: true },
    { id: 2, name: 'Comfort cooling', value: null, abs: null, corr: 0, show: true },
    { id: 3, name: 'Empty house', value: null, abs: null, corr: 0, show: true },
    { id: 4, name: 'Heat protection', value: null, abs: null, corr: 0, show: true },
    { id: 5, name: 'Increased heat', value: null, abs: null, corr: 1, show: true },
    { id: 6, name: 'Party', value: null, abs: null, corr: 1, show: true },
    { id: 7, name: 'Manual', value: null, abs: null, corr: 0, show: true }
  ];

  selectTemperaturePreset = {
    header: this.translate.instant('Temperature preset'),
    cssClass: 'actionsheet'
  };

  selectOperatingMode = {
    header: this.translate.instant('Operating mode'),
    cssClass: 'actionsheet'
  };

  labelTemperature = this.translate.instant('Temperature');
  labelMode = this.translate.instant('Mode');

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
    let ircModeList = [...this.ircModesDefaults];

    let temp = ['',''];
    let mode = control.states.mode;
    let heatCoolId = ((mode == 1) || (mode == 3) || (mode == 5)) ? 1 : 2; // heating=id:1, cooling=id:2

    if (control.states.tempActual) {
      temp = sprintf("%.1f", control.states.tempActual).split('.');
      temp[1] = '.' + temp[1];
    }

    let isAbsoluteTemp = control.details.temperatures;
    temperatureModes.forEach( (item, index) => {
      if ((isAbsoluteTemp[index] && isAbsoluteTemp[index].isAbsolute) || index ==7 ) { // absolute or manual value, no corrections
        item.corr = 0;
        item.value = (index < 7) ? Number(control.states.temperatures[index]) : Number(control.states.tempTarget);
        item.abs = item.value;
      }
      if (isAbsoluteTemp[index] && !isAbsoluteTemp[index].isAbsolute) { // relative values, so calcuate new value
        let sign = -1;
        if (index == 5) sign = 1; // increased heat should be addition
        if (index == 0 && heatCoolId == 2) sign = 1; // eco mode in cooling period should be addition
        item.corr = sign; // copy isAbsolute field correction into temp preset for later use
        item.value = Number(control.states.temperatures[index]);
        item.abs = Number(control.states.temperatures[heatCoolId]) + sign * Number(control.states.temperatures[index]);
      }
    })

    // when selecting 'Automatic (currently heating)' or 'Automatic (currently cooling)'
    // override the first entry in the listbox, and restore it afterwards
    if (control.states.mode && ((control.states.mode == 1) || (control.states.mode == 2))) {
      ircModeList[0].name = ircModeList[control.states.mode].name;
    }
    else {
      ircModeList[0].name = 'Automatic';
    }

    let subControls = Object.keys(control.subControls);
    let state = null;

    if (control.subControls[subControls[0]].states.value) {
      state = control.subControls[subControls[0]].states.value; // TODO read states from both subControls?
    }

    let showIdx = temperatureModes.findIndex( item => item.id === (3-heatCoolId) );
    temperatureModes[showIdx].show = false; // hide
    let presetList = temperatureModes;
    let preset = presetList.find( item => item.id == state );

    const vm: IRCVM = {
      control: control,
      ui: {
        name: this.translate.instant('Thermostat'),
        room: (room && room.name) ? room.name : 'unknown',
        category: (category && category.name) ? category.name : 'unknown',
        tempTarget: control.states.tempTarget,
        tempActual: control.states.tempActual,
        tempUnit: '°C', // TODO make configurable
        modeList: ircModeList,
        mode: control.states.mode ? control.states.mode : 0, // TODO check
        presetList: presetList,
        preset: preset.id,
        icon: {
          tempBase: temp[0],
          tempDec: temp[1]
        },
        status: {
          text: state ? preset.name : 'unknown', // translate in scss to enable radio selection highlighting
          color: (preset.id > 0) ? Utils.getColor('primary') : Utils.getColor('secondary')
        }
      }
    };
    return vm;
  }

  setOperatingMode(vm, $event) {
    let newMode = vm.ui.modeList.find( item => item.name == $event.detail.value );
    if (newMode && (newMode.id != vm.ui.mode)) {
      let cmd = 'mode/' + newMode.id;
      this.controlService.updateControl(vm.control, cmd);
    }
  }

  setTemperaturePreset(vm, $event) {
    let newPreset = vm.ui.presetList.find( item => item.name == $event.detail.value );
    if (newPreset && (newPreset.id != vm.ui.preset)) {
      //let cmd = 'settemp/' + String(present.id) + '/' + String(present.value);
      let cmd = 'starttimer/' + String(newPreset.id) + '/60';
      this.controlService.updateControl(vm.control, cmd);
    }
  }

  setTargetTemperature(vm, $event) {
    let temp = Math.round($event*2)/2;
    let cmd = 'settemp/7/' + String(temp);
    this.controlService.updateControl(vm.control, cmd);
    //console.log('setTargetTemperature', temp);
  }

}
