import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Control, SubControl, Category, Room } from '../interfaces/data.model';
import { DataService } from './data.service';
import { LoxBerryService } from '../services/loxberry.service';

@Injectable({ providedIn: 'root' })
export class ControlService {

  constructor(private dataService: DataService,
    public loxberryService: LoxBerryService) {
  }

  get controls$(): Observable<Control[]> {
    return this.dataService.select$((state) => Object.values(state.structure.controls)).pipe(
      shareReplay()
    );
  }

  get categories$(): Observable<Category[]> {
    return this.dataService.select$((state) => Object.values(state.structure.categories)).pipe(
      shareReplay()
    );
  }

  get rooms$(): Observable<Room[]> {
    return this.dataService.select$((state) => Object.values(state.structure.rooms)).pipe(
      shareReplay()
    );
  }

  getControl$(serialNr: string, uuid: string): Observable<Control> {
    return this.dataService.select$((state) => state.structure.controls[serialNr + '/' + uuid]).pipe(
      shareReplay()
    );
  }

  getSubControl$(serialNr: string, uuid: string, subControlUuid: string): Observable<SubControl> {
    return this.dataService.select$((state) =>
      state.structure.controls[serialNr + '/' + uuid].subControls[subControlUuid]).pipe(
        shareReplay()
      );
  }

  updateControl(control: Control | SubControl, msg: string): void {
    this.loxberryService.sendMessage(control, msg);
  }

}