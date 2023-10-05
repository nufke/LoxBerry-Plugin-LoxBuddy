import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { TextVM } from '../../interfaces/view.model';
import { View } from '../../types/types';
import { Utils } from '../../utils/utils';

var sprintf = require('sprintf-js').sprintf;

interface Status {
  text: string;
  color: string;
}

@Component({
  selector: 'control-fronius-view',
  templateUrl: 'control-fronius.view.html',
  styleUrls: ['./control-fronius.view.scss'],
})
export class ControlFroniusView
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

    let prod = 'P '; // English Production, Dutch: Productie, German: Produktion 
    let cons = 'V '; // Dutch: Verbruik, German: Verbrauch

    if (this.translate.currentLang == 'en') {
      cons = 'C '; // only for english we need to change the prefix to C = Consumption
    }

    let text = prod +  Number(sprintf('%.2f', control.states.prodCurr)).toLocaleString(this.translate.currentLang) + ' kW • ' + 
               cons +  Number(sprintf('%.2f', control.states.consCurr)).toLocaleString(this.translate.currentLang) + ' kW';

    const vm: TextVM = {
      control: {
        ...control,
        icon: {
          href: 'assets/icons/svg/leaf.svg',
          color: 'primary'
        },
        states: {
          prodCurr: this.format(control.states.prodCurr, 'kW'),
          prodCurrDay: this.format(control.states.prodCurrDay, 'kWh'),
          prodCurrMonth: this.format(control.states.prodCurrMonth, 'kWh'),
          prodCurrYear: this.format(control.states.prodCurrYear, 'kWh'),
          prodTotal: this.format(control.states.prodTotal, 'kWh'),
          consCurr: this.format(control.states.consCurr, 'kW'),
          consCurrDay: this.format(control.states.consCurrDay, 'kWh'),
          gridCurr: this.format(control.states.gridCurr, 'kW'),
          batteryCurr: this.format(control.states.batteryCurr, 'kW'),
          stateOfCharge: this.format(control.states.stateOfCharge, ''),
          earningsDay: this.format(control.states.earningsDay, 'euro'), // TODO unit
          earningsMonth: this.format(control.states.earningsMonth, 'euro'),
          earningsYear: this.format(control.states.earningsYear, 'euro'),
          earningsTotal: this.format(control.states.earningsTotal, 'euro'),
          priceDelivery: this.format(control.states.priceDelivery, ''),
          priceConsumption: this.format(control.states.priceConsumption, ''),
          co2Factor: control.states.prodCurr.co2Factor,
          generatorType: control.states.prodCurr.generatorType,
          mode: control.states.mode,
          online: control.states.prodCurr.online,
        }
      },
      ui: {
        name: control.name,
        room: (room && room.name) ? room.name : 'unknown',
        category: (category && category.name) ? category.name : 'unknown',
        status: {
          text: text,
          color: Utils.getColor('primary')
        }
      }
    };
    return vm;
  }

  format(str: string, unit: string): string {
    let value = Number(str); 
    return String(Number(sprintf('%.2f', value)).toLocaleString(this.translate.currentLang)) + ' ' + unit;
  }

}
