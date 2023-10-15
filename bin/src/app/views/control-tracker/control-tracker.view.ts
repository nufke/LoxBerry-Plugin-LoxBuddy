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
  items: MessageItem[];
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

  dates: string[] = [];

  item: {
    date: string;
    time: string;
    descr: string;
  }

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
    let messageItem = [];

    for (let i = splitEntries.length-1; i > -1; i--) {
      let elements = splitEntries[i].split(" "); 
      if (this.dates.findIndex( date => date === elements[0]) == -1) {
        this.dates.push(elements[0]);
      }
      let item = {
        date: elements[0],
        time: elements[1],
        description: splitEntries[i].substring(splitEntries[i].indexOf(elements[1]) + elements[1].length + 1)
      };
      messageItem.push(item);
    };

    const vm: MessageItemVM = {
      items: messageItem,
    };
    return vm;
  }

  filter_date(date: string): Observable<MessageItem[]> {
    return this.vm$.pipe(
      map(elem => elem.items.filter(item => (item.date === date))))
  }

  locale_date(date: string) {
    return moment(date).locale(this.translate.currentLang).format('LL');
  }
}
