import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { Control, SubControl, Room, Category } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { RadioVM, RadioListItem } from '../../interfaces/view.model';
import { ButtonAction, View } from '../../types/types';

@Component({
  selector: 'control-light-v2-view',
  templateUrl: 'control-light-v2.view.html',
  styleUrls: ['./control-light-v2.view.scss'],
})
export class ControlLightV2View
  implements OnInit, OnDestroy {

  @Input() control: Control;
  @Input() view: View;

  buttonType = ButtonAction;
  viewType = View;
  vm$: Observable<RadioVM>;
  segment: string = 'moods';
  moodList: RadioListItem[] = [];
  text: string = '';

  customActionSheetOptions = {
    header: '',
    cssClass: 'actionsheet',
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
      console.error('Component \'control-light-v2\' not available for rendering.');
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

  private updateVM(control: Control, categories: Category[], rooms: Room[]): RadioVM {
    let room: Room = rooms.find(room => room.uuid === control.room && room.serialNr === control.serialNr);
    let category: Category = categories.find(category => category.uuid === control.category && category.serialNr === control.serialNr);
    let selectedId;

    if (Array.isArray(control.states.activeMoods)) {
      selectedId = control.states.activeMoods[0]; /* if undefined/empty, mode is most likely manual (see below) */
    }

    /* only update radioList if we have new entries, since it might cause GUI interruptions */
    if (control.states.moodList && (this.moodList !== control.states.moodList)) {
      this.moodList = control.states.moodList;
    }

    if (selectedId && control.states.moodList && Array.isArray(this.moodList)) {
      let moodIdx = this.moodList.findIndex(item => item.id == selectedId );
      this.text = this.moodList[moodIdx].name;
    }
    else { /* undefined/empty, so manual */
      this.text = this.translate.instant('Manual');
    }

    let visibleSubControls = [];

    if (control.subControls) {
      let allSubControls: SubControl[] = Object.values(control.subControls);
      visibleSubControls = allSubControls.filter( subControl => subControl.isVisible );
    }

    this.customActionSheetOptions.header = (category.name) + ' ' + (room && room.name) ? room.name : "unknown";

    const vm: RadioVM = {
      control: {
        ...control,
        icon: {
          href: control.icon.href,
          color: (selectedId !== 778 && this.text.length) ? "primary" : "#9d9e9e" // TODO select from color palette
        }
      },
      ui: {
        /* TODO: Loxone replaces default controller name with room name, should we keep it? */
        name: (control.name === this.translate.instant('Lightcontroller')) ? room.name : control.name,
        room: (room && room.name) ? room.name : "unknown",
        category: (category && category.name) ? category.name : "unknown",
        radioList: this.moodList,
        selectedId: selectedId,
        status: {
          text: this.text,
          color: (selectedId !== 778 && this.text.length) ? "#69c350" : "#9d9e9e" // TODO select from color palette
        }
      },
      subControls: visibleSubControls,
    };
    return vm;
  }

  updateSegment() {
    // Close any open sliding items when the schedule updates
  }

  clickLightButton(action: ButtonAction, vm: RadioVM, $event) {
    $event.preventDefault();
    $event.stopPropagation();

    let moodIdx;
    let moodList = this.control.states.moodList;

    let max = vm.ui.radioList.length - 1;

    if (vm.ui.selectedId && vm.ui.radioList) {
      moodIdx = vm.ui.radioList.findIndex(item => { return item.id == vm.ui.selectedId });
      moodIdx++;
      if (moodIdx > max) moodIdx = 0;
    }
    else {
      moodIdx = 0;
    }
    this.controlService.updateControl(vm.control, 'changeTo/' + String(moodList[moodIdx].id));
  }

  selectChange(vm: RadioVM, event) {
    let moodList = this.control.states.moodList;
    let moodIdx = vm.ui.radioList.findIndex(item => { return item.name == event.detail.value });

    /* only send update if mood exists and selected_id is different */
    if (moodList[moodIdx] && moodList[moodIdx].id != vm.ui.selectedId)
      this.controlService.updateControl(vm.control, 'changeTo/' + String(moodList[moodIdx].id));
  }

}
