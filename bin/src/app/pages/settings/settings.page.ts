import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IonRouterOutlet } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AppSettings } from '../../interfaces/data.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  previousUrl: string;
  canGoBack: boolean;

  timeoutList = [5, 10, 15, 30, 60];
  timeoutListItem;
  timeout : number; 
  lockPage: boolean;
  appSettings: AppSettings;
  pin: string;
  hidePassword: string = 'password';
  eye: string = 'eye';

  private routerEvents: any;
  private currentUrl: string;

  private storageSubscription: Subscription;

  constructor(
    private router: Router,
    private ionRouterOutlet: IonRouterOutlet,
    private storageService: StorageService) {

    this.storageSubscription = this.storageService.settings$.subscribe( settings => {
      if (settings && settings.app) {
        this.appSettings = settings.app;
        this.lockPage = (settings.app.lockPage || settings.app.lockPage === undefined);
        this.timeout = settings.app.timeout ? settings.app.timeout : 5*60000;  // default 5 minute
        this.pin = settings.app.pin ? settings.app.pin : '0000';
        this.timeoutListItem = this.timeoutList.find( item => item == this.timeout/60000);
      }
    });
  }

  ngOnInit() {
    this.canGoBack = this.ionRouterOutlet.canGoBack();
    this.currentUrl = this.router.url;

    this.routerEvents = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          this.previousUrl = this.currentUrl;
          this.currentUrl  = event.url;
      }
    });
  }

  setTimeout($event) {
    this.timeout = Number($event.detail.value) * 60000; // in minutes
    this.saveSettings();
  }

  setPIN($event) {
    this.pin = $event.detail.value;
    this.saveSettings();
  }

  onToggleLockPage() {
    this.saveSettings();
  }

  toggleHidePassword() {
    this.hidePassword = this.hidePassword === 'text' ? 'password' : 'text';
    this.eye = this.eye === 'eye' ? 'eye-off' : 'eye';
  }

  private saveSettings() {
    this.storageService.saveSettings({
      app: {
        darkTheme: this.appSettings.darkTheme,
        language: this.appSettings.language,
        lockPage: this.lockPage,
        timeout: this.timeout,
        //enableBiometricId: this.enableBiometricId,
        pin: this.pin
      }
    });
  }
}
