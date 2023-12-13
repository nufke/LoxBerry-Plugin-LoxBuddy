import { Injectable } from '@angular/core';
import { EncryptStorage } from 'encrypt-storage';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { DataService } from './data.service';
import { Settings, INITIAL_SETTINGS } from '../interfaces/data.model';

export const SETTINGS_TOKEN_KEY = 'lxb-settings-token';
export const encryptStorage = new EncryptStorage('DNGS9SDJ3NFS9F5DNRW8AHSDN3WAQSF');

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private dataService: DataService) {
    this.initStorage();
  }

  async initStorage() {
    this.getSettingsFromEncryptedStorage().then( settings => {
      if (!settings) return;
      settings.app.id = settings.app.id ? settings.app.id : uuidv4();
      settings.app.darkTheme = settings.app.darkTheme ? settings.app.darkTheme : true;
      settings.app.language = settings.app.language ? settings.app.language : 'en';
      settings.app.lockPage = settings.app.lockPage ? settings.app.lockPage : false;
      settings.app.timeout = settings.app.timeout ? settings.app.timeout : 10*60000;  // default 10 minutes
      settings.app.pin = settings.app.pin ? settings.app.pin : '0000';
      settings.app.localNotifications = settings.app.localNotifications ? settings.app.localNotifications : false;
      settings.app.remoteNotifications = settings.app.remoteNotifications ? settings.app.remoteNotifications : false;
      settings.mqtt.hostname = settings.mqtt.hostname ? settings.mqtt.hostname : '';
      settings.mqtt.port = settings.mqtt.port ? settings.mqtt.port : 9083;
      settings.mqtt.username = settings.mqtt.username ? settings.mqtt.username : 'loxberry';
      settings.mqtt.password = settings.mqtt.password ? settings.mqtt.password : '';
      settings.mqtt.topic = settings.mqtt.topic ? settings.mqtt.topic : 'loxone';
      settings.messagingService.url = settings.messagingService.url ? settings.messagingService.url : '';
      settings.messagingService.id = settings.messagingService.id ? settings.messagingService.id : '';
      settings.messagingService.key = settings.messagingService.key ? settings.messagingService.key : '';
      //console.log('settings', settings);
      encryptStorage.setItem(SETTINGS_TOKEN_KEY, JSON.stringify(settings));
      this.dataService.putSettingsInStore(settings);
    });
  }

  get settings$(): Observable<Settings> {
    return this.dataService.settings$;
  }

  private async getSettingsFromEncryptedStorage() : Promise<Settings> {
    return encryptStorage.getItem(SETTINGS_TOKEN_KEY);
  }

  async saveSettings(settings: Settings) : Promise<void> {
    let currentSettings: Settings = this.dataService.getCurrentSettingsFromStore();
    let s = { ...currentSettings, ...settings};
    this.dataService.putSettingsInStore(s);
    return encryptStorage.setItem(SETTINGS_TOKEN_KEY, JSON.stringify(s));
  }

  async cleanStorage() : Promise<void> {
    return encryptStorage.setItem(SETTINGS_TOKEN_KEY, JSON.stringify(INITIAL_SETTINGS));
  }
}
