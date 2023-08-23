import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';
import { Control, Room, Category } from '../../interfaces/data.model';
import { ControlListVM } from '../../interfaces/view.model';
import { View } from '../../types/types';

@Component({
  selector: 'app-controls',
  templateUrl: 'controls.page.html',
  styleUrls: ['controls.page.scss']
})
export class ControlsPage
  implements OnInit, OnDestroy {

  vm$: Observable<ControlListVM>;
  key: string;
  viewType = View;
  isHome: boolean;

  constructor(
    public translate: TranslateService,
    private route: ActivatedRoute,
    private controlService: ControlService) {
  }

  ngOnInit(): void {
    this.initVM();
  }

  ngOnDestroy(): void {
  }

  /**
   * Initialize view model
   *
   * The view model will contain room and category name instead of uuid
   */
  private initVM(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');           // uuid of room or category
    const serialNr = this.route.snapshot.paramMap.get('serialNr'); // serialNr of room or category

    this.isHome = false;
    this.vm$ = combineLatest([
      this.controlService.controls$,
      this.controlService.categories$,
      this.controlService.rooms$,
    ]).pipe(
      map(([controls, categories, rooms]) => {
        let labels;
        let keys;
        let filtered_labels;
        let filtered_controls = controls
          .filter(control => control.isVisible && control.category === uuid && control.serialNr === serialNr);
        if (filtered_controls.length) { // TODO check if there are no controls at all....
          this.key = 'room'
          keys = categories;
          labels = rooms;
          filtered_labels = filtered_controls.map(control => control.room);
        }
        else {
          filtered_controls = controls
            .filter(control => control.isVisible && control.room === uuid && control.serialNr === serialNr);
          this.key = 'category'
          keys = rooms;
          labels = categories;
          filtered_labels = filtered_controls.map(control => control.category);
        }
        const vm: ControlListVM = {
          controls: filtered_controls,
          favorites: filtered_controls.filter(control => control.isFavorite)
            .sort((a, b) => (a.order[1] - b.order[1] || a.name.localeCompare(b.name))),
          labels: labels.filter(item => filtered_labels.indexOf(item.uuid) > -1)
            .sort((a, b) => (a.name.localeCompare(b.name))),
          page: keys.find(item => (item.uuid === uuid) && (item.serialNr === serialNr))
        };
        return vm;
      })
    );

    /* home */
    if (uuid === null && serialNr === null) {
      this.isHome = true;
      this.vm$ = this.controlService.controls$.pipe(
        map(controls => {
          controls = controls
            .filter(control => (control.order[2] > 0) && control.isVisible)
            .sort((a, b) => (a.order[2] - b.order[2] || a.name.localeCompare(b.name)));
          const vm: ControlListVM = {
            controls: null,
            favorites: controls,
            labels: null,
            page: { name: 'Home' }
          };
          return vm;
        })
      );
    }
  }

  filter_list(label: Room | Category): Observable<Control[]> {
    return this.vm$.pipe(
      map(items => items.controls
        .filter(item => item[this.key] === label.uuid)
        .sort((a, b) => (a.order[0] - b.order[0] || a.name.localeCompare(b.name)))));
  }
}
