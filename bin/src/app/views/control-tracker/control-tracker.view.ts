import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { ActivatedRoute } from '@angular/router';
import { Control, SubControl, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { ButtonAction, View } from '../../types/types';
import * as moment from 'moment';

interface MessageItem {
  date: string;
  time: string;
  description: string;
}

interface MessageItemVM {
  items: { [key: string]: MessageItem[] };
}

@Component({
  selector: 'control-tracker-view',
  templateUrl: 'control-tracker.view.html',
  styleUrls: ['./control-tracker.view.scss'],
})
export class ControlTrackerView
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;
  @Input() key: string;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<MessageItemVM>;

  constructor(
    public translate: TranslateService,
    public controlService: ControlService,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.initVM();
  }

  ngOnDestroy(): void {
  }

  private initVM(): void {
    const subControlUuid = this.route.snapshot.paramMap.get('subControlUuid');
    const subControlUuidExt = this.route.snapshot.paramMap.get('subControlUuidExt');

    console.log('subcontrol:', subControlUuid, subControlUuidExt);
    if (this.control === undefined) {
      console.error('Component \'control-tracker\' not available for rendering.');
      return;
    }

    if ((subControlUuid === undefined) && (subControlUuidExt === undefined)) {
      console.error('Subcontrol of component \'control-tracker\' not available for rendering.');
      return;
    }

    this.vm$ = combineLatest([
      this.controlService.getControl$(this.control.serialNr, this.control.uuid),
      this.controlService.getSubControl$(this.control.serialNr, this.control.uuid, subControlUuid + '/' + subControlUuidExt)
    ]).pipe(
      map(([control, subControl]) => {
        return this.updateVM(control, subControl);
      })
    );
  }

  private updateVM(control: Control, subControl: SubControl) : MessageItemVM {
    const entries = subControl.states.entries;
    if (!entries) return;

    // split entries and remove special hex character 0x14
    const splitEntries = subControl.states.entries.replace(/\x14/g,': ').split("|");
    let dates = [];
    let entryList = [];
    let items = {};

    splitEntries.forEach( item => {
      let elements = item.split(" "); 
      if (dates.findIndex( date => date === elements[0]) == -1) {
        dates.push(elements[0]);
      };
      let descr = {
        date: elements[0],
        time: elements[1],
        description: item.substring(item.indexOf(elements[1]) + elements[1].length + 1)
      };
      entryList.push(descr);
    });

    for (let i = dates.length-1; i > -1; i--) {
      items[dates[i]] = entryList.filter( item => item.date === dates[i])
    }

    const vm: MessageItemVM = {
      items: items
    };
    return vm;
  }

  getSize(items: any) : number {
    if (!items) return 0;
    return Object.keys(items).length;
  }
  
  getDate(items: any) : string[] {
    if (!items) return [];
    return Object.keys(items);
  }
  
  localDate(date: string) {
    return moment(date).locale(this.translate.currentLang).format('LL');
  }
}
