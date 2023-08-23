import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Control, Room } from '../../interfaces/data.model';
import { ControlService } from '../../services/control.service';
import { RoomListVM } from '../../interfaces/view.model';

@Component({
  selector: 'app-rooms',
  templateUrl: 'rooms.page.html',
  styleUrls: ['rooms.page.scss']
})
export class RoomsPage
  implements OnInit, OnDestroy {

  @ViewChild(IonContent, { static: false }) content: IonContent;

  vm$: Observable<RoomListVM>;

  constructor(
    public translate: TranslateService,
    private controlService: ControlService) {
  }

  ngOnInit(): void {
    this.initVM();
  }

  ngOnDestroy(): void {
  }

  ionViewWillEnter(): void {
    this.content.scrollToTop();
  }

  private initVM(): void {
    this.vm$ = combineLatest([
      this.controlService.controls$,
      this.controlService.rooms$
    ]).pipe(
      map(([controls, rooms]) => {
        return this.updateVM(controls, rooms);
      })
    );
  }

  private updateVM(controls: Control[], rooms: Room[]): RoomListVM {
    controls = controls
      .filter(control => control.isVisible);
    let filteredRooms = controls.map(control => control.room);
    let roomsList = rooms
      .filter(room => room.isVisible && !room.isFavorite && filteredRooms.indexOf(room.uuid) > -1)
      // TODO remove duplicates?
      //.filter((value, index, self) => self.indexOf(value) === index) // TODO remove duplicates
      //.filter((value, index, self) => index === self.findIndex((t) => ( t.name === value.name ))) // remove items with duplicate names
      .sort((a, b) => (a.order[0] - b.order[0] || a.name.localeCompare(b.name)));
    let roomsFavs = rooms
      .filter(room => room.isVisible && room.isFavorite && filteredRooms.indexOf(room.uuid) > -1)
      // TODO remove duplicates?
      //.filter((value, index, self) => self.indexOf(value) === index) // TODO remove duplicates
      //.filter((value, index, self) => index === self.findIndex((t) => ( t.name === value.name ))) // remove items with duplicate names
      .sort((a, b) => (a.order[1] - b.order[1] || a.name.localeCompare(b.name)));
    const vm: RoomListVM = {
      rooms: rooms,
      roomsList: roomsList,
      roomsFavs: roomsFavs
    };
    return vm;
  }
}
