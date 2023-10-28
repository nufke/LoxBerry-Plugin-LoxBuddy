import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { shareReplay, map, find } from 'rxjs/operators';
import { Control, SubControl, Category, Room } from '../interfaces/data.model';
import { DataService } from './data.service';
import { LoxBerryService } from '../services/loxberry.service';

@Injectable({
  providedIn: 'root'
})
export class ControlService {

  constructor(
    private dataService: DataService,
    private loxberryService: LoxBerryService) {
  }

  get controls$(): Observable<Control[]> {
    return this.dataService.controls$;
  }

  get categories$(): Observable<Category[]> {
    return this.dataService.categories$;
  }

  get rooms$(): Observable<Room[]> {
    return this.dataService.rooms$;
  }

  getControl$(serialNr: string, uuid: string): Observable<Control> {
    return this.dataService.controls$.pipe(
      map( (controls) => controls
        .find( control => (control.uuid === uuid) && (control.serialNr === serialNr))
      ),
      shareReplay()
    );
  }

  getSubControl$(serialNr: string, uuid: string, subControlUuid: string): Observable<SubControl> {
    return this.dataService.controls$.pipe(
      map( (controls) => controls
        .find( control => (control.uuid === uuid) && (control.serialNr === serialNr) &&
                          (control.subControls[subControlUuid].uuid === subControlUuid))
      ),
      shareReplay()
    );
  }

  updateControl(control: Control | SubControl, msg: string): void {
    this.loxberryService.sendMessage(control, msg);
  }

}
