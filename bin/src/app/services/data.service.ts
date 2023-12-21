import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, distinctUntilKeyChanged, distinctUntilChanged } from 'rxjs/operators';
import { Control, Category, Room, Settings, AppState, GlobalStates, NotificationMessage, INITIAL_APP_STATE, PMSSettings } from '../interfaces/data.model';
import { Store } from './store';

@Injectable({
  providedIn: 'root'
})
export class DataService extends Store<AppState> {

  constructor() {
    super(INITIAL_APP_STATE);
  }

  get settings$(): Observable<Settings> {
    return this.select$((state) => state.settings).pipe(
      //distinctUntilKeyChanged('mqtt'),
      distinctUntilChanged(), // inform all subscribers when changed
      shareReplay()
    );
  }

  get pmsSettings$(): Observable<PMSSettings> {
    return this.select$((state) => state.settings.pms).pipe(
      distinctUntilChanged(), // inform all subscribers when changed
      shareReplay()
    );
  }

  get categories$(): Observable<Category[]> {
    return this.select$((state) => Object.values(state.structure.categories)).pipe(
      shareReplay()
    );
  }

  get rooms$(): Observable<Room[]> {
    return this.select$((state) => Object.values(state.structure.rooms)).pipe(
      shareReplay()
    );
  }

  get controls$(): Observable<Control[]> {
    return this.select$((state) => Object.values(state.structure.controls)).pipe(
      shareReplay()
    );
  }
  
  get globalStates$(): Observable<GlobalStates[]> {
    return this.select$((state) => Object.values(state.structure.globalStates)).pipe(
      shareReplay()
    );
  }

  get notifications$(): Observable<NotificationMessage[]> {
    return this.selectByKey$('notifications').pipe(
      distinctUntilChanged(),
      shareReplay()
    );
  }

  getCurrentSettingsFromStore(): Settings {
    return this.state.settings;
  }

  getDevices(): string[] {
    return Object.keys(this.state.structure.msInfo);
  }

  putSettingsInStore(settings: Settings) {
    this.setState({
      settings: settings
    });
  }

  flushStructureInStore(): void {
    this.setState( (state) => {
      state.structure.msInfo = {};
      state.structure.globalStates = {};
      state.structure.controls = {};
      state.structure.categories = {};
      state.structure.rooms = {};
      return ({ ...state });
    });
  }

  flushControlsInStore(mqttTopic: string): void {
    this.setState( (state) => {
      Object.keys(state.structure.controls).forEach(key => {
        if (key.split('/')[0] == mqttTopic) {
          delete state.structure.controls[key];
        }
      });

      Object.keys(state.structure.categories).forEach(key => {
        if (key.split('/')[0] == mqttTopic) {
          delete state.structure.categories[key];
        }
      });

      Object.keys(state.structure.rooms).forEach(key => {
        if (key.split('/')[0] == mqttTopic) {
          delete state.structure.rooms[key];
        }
      });

      return ({ ...state });
    });
  }

  async updateStructureInStore(obj: any) {
    this.setState((state) => {

      Object.keys(obj.msInfo).forEach(key => { // key=serialnr
        let item = obj.msInfo[key];
        state.structure.msInfo[key] = item;
      });

      Object.keys(obj.globalStates).forEach(key => { // key=serialnr
        let item = obj.globalStates[key];
        state.structure.globalStates[key] = item;
      });

      Object.keys(obj.controls).forEach(key => {
        let control = obj.controls[key];

        // updated structure cannot override existing control states
        if (state.structure.controls[this.getId(control)] && state.structure.controls[this.getId(control)].states) {
          control.states = state.structure.controls[this.getId(control)].states;
        }

        // updated structure cannot override existing subcontrol states
        if (state.structure.controls[this.getId(control)] && state.structure.controls[this.getId(control)].subControls) {
          Object.keys(state.structure.controls[this.getId(control)].subControls).forEach(key => {
            let subControlStates = state.structure.controls[this.getId(control)].subControls[key].states;
            if (subControlStates) {
              control.subControls[key].states = subControlStates;
            }
          });
        }

        state.structure.controls[this.getId(control)] = control;
      });

      Object.keys(obj.categories).forEach(key => {
        let category = obj.categories[key];
        state.structure.categories[this.getId(category)] = category;
      });

      Object.keys(obj.rooms).forEach(key => {
        let room = obj.rooms[key];
        state.structure.rooms[this.getId(room)] = room;
      });
      return ({ ...state });
    });
  }


  async updateElementsInStore(mqttMessage: any) {
    this.setState((state) => {
      mqttMessage.forEach(message => {
        if (!message.topic) return;
        let topics = message.topic.split('/');
        let value = message.payload.toString();
        //console.log('updateElementInStore', message.topic, value);
        let id = topics[0] + '/' + topics[1];

        if ((topics[1] === 'globalStates') && (state.structure.globalStates[topics[0]])) {
          this.stateUpdate(state.structure.globalStates[topics[0]], id, message.topic, value);
        }

        if (state.structure.controls[id]) {
          this.stateUpdate(state.structure.controls[id], id, message.topic, value);
        }

        if (state.structure.categories[id]) {
          this.stateUpdate(state.structure.categories[id], id, message.topic, value);
        }

        if (state.structure.rooms[id]) {
          this.stateUpdate(state.structure.rooms[id], id, message.topic, value);
        }
      });
      return ({ ...state });
    });
  }

  private stateUpdate(obj, name, topic, value) {
    Object.keys(obj).forEach(key => {
      //console.log('stateUpdate: topic ', name + '/' + key);
      if (name + '/' + key === topic) {
        obj[key] = this.isValidJSONObject(value) ? JSON.parse(value) : value;
        //console.log('stateUpdate: topic ', topic, obj[key], value );
        if (key === 'notifications') {
          this.storeNotification(obj[key]);
        }
        return;
      }
      else
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.stateUpdate(obj[key], name + '/' + key, topic, value);
        }
    });
  }

  private storeNotification(msg: NotificationMessage) {
    // only store if ID does not exist
    if (this.state.notifications.find( notification => notification.uid === msg.uid) == undefined) {
      this.setState( (state) => {
        state.notifications = [msg, ...state.notifications ]; // add new notification at front of list
        return ({...state});
      });
    }
  }

  private isValidJSONObject(str: string) {
    let obj;
    try {
      obj = JSON.parse(str);
    } catch (e) {
      return false;
    }
    if (typeof obj === 'object') return true;
    else false;
  }

  private getId(obj: Control | Category | Room): string {
    return obj.serialNr + '/' + obj.uuid;
  }

}
