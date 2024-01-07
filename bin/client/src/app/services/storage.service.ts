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
    if (this.getEncryptedStorageSize() == 0) {
      let settings = INITIAL_SETTINGS;
      // assign unique AppID for very first storage initialization 
      settings.app.id = uuidv4();
      encryptStorage.setItem(SETTINGS_TOKEN_KEY, JSON.stringify(settings));
      this.dataService.putSettingsInStore(settings);
    }

    this.getSettingsFromEncryptedStorage().then( settings  => {
      if (!settings) return;
      this.dataService.putSettingsInStore(settings);
    }).catch( error => console.error(error));
  }

  get settings$(): Observable<Settings> {
    return this.dataService.settings$;
  }
  
  private getEncryptedStorageSize() {
    return encryptStorage.length;
  }

  private async getSettingsFromEncryptedStorage() : Promise<Settings> {
    return encryptStorage.getItem(SETTINGS_TOKEN_KEY);
  }

  async saveSettings(settings: Settings) : Promise<void> {
    let currentSettings: Settings = this.dataService.getCurrentSettingsFromAppState();
    let s = { ...currentSettings, ...settings};
    this.dataService.putSettingsInStore(s);
    return encryptStorage.setItem(SETTINGS_TOKEN_KEY, JSON.stringify(s));
  }

  async cleanStorage() : Promise<void> {
    return encryptStorage.setItem(SETTINGS_TOKEN_KEY, JSON.stringify(INITIAL_SETTINGS));
  }
}
