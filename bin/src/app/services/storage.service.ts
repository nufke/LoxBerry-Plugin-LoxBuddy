import { Injectable } from '@angular/core';
import { EncryptStorage } from 'encrypt-storage';
import { Observable } from 'rxjs';
import { DataService } from './data.service';
import { Settings } from '../interfaces/data.model';

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

  initStorage() {
    this.getSettingsFromEncryptedStorage().then( settings => {
      this.dataService.putSettingsInStore(settings)
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
    return encryptStorage.setItem(SETTINGS_TOKEN_KEY, JSON.stringify({}));
  }
}
