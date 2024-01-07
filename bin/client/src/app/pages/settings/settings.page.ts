import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IonRouterOutlet } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { AppSettings } from '../../interfaces/data.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {

  previousUrl: string;
  canGoBack: boolean;

  timeoutList = [5, 10, 15, 30, 60];
  timeoutListItem;
  timeout : number; 
  lockPage: boolean;
  appSettings: AppSettings;
  pin: string;
  language: string;
  languageFullName: string;
  localNotifications: boolean;
  remoteNotifications: boolean;
  hidePassword: string = 'password';
  eye: string = 'eye';

  languageOpts = {
    en: "English",
    nl: "Dutch",
    de: "German",
  }

  private routerEventsSubscription: Subscription;
  private storageSubscription: Subscription;
  private currentUrl: string;

  constructor(
    private router: Router,
    private ionRouterOutlet: IonRouterOutlet,
    private storageService: StorageService,
    public translate: TranslateService) {

    this.storageSubscription = this.storageService.settings$.subscribe( settings => {
      if (settings && settings.app) {
        this.appSettings = settings.app;
        this.lockPage = settings.app.lockPage;
        this.timeout = settings.app.timeout;
        this.pin = settings.app.pin;
        this.language = settings.app.language;
        this.languageFullName = this.getLanguage(settings.app.language);
        this.translate.use(settings.app.language);
        this.timeoutListItem = this.timeoutList.find( item => item == this.timeout/60000);
        this.localNotifications = settings.app.localNotifications;
        this.remoteNotifications = settings.app.remoteNotifications;
      }
    });
  }

  ngOnInit(): void {
    this.canGoBack = this.ionRouterOutlet.canGoBack();
    this.currentUrl = this.router.url;

    this.routerEventsSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          this.previousUrl = this.currentUrl;
          this.currentUrl  = event.url;
      }
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
    this.storageSubscription.unsubscribe();
  }

  setTimeout($event) {
    this.timeout = Number($event.detail.value) * 60000; // in minutes
    this.saveSettings();
  }

  setPIN($event) {
    this.pin = $event.detail.value;
    this.saveSettings();
  }

  getLanguage(language: string) {
    return this.languageOpts[language];
  }

  setLanguage(language2: string) {
    this.language = Object.keys(this.languageOpts).find(key => this.languageOpts[key] === language2);
    this.translate.use(this.language);
    this.saveSettings();
  }

  toggleHidePassword() {
    this.hidePassword = this.hidePassword === 'text' ? 'password' : 'text';
    this.eye = this.eye === 'eye' ? 'eye-off' : 'eye';
  }

  saveSettings() {
    this.storageService.saveSettings({
      app: {
        ...this.appSettings,
        lockPage: this.lockPage,
        timeout: this.timeout,
        pin: this.pin,
        language: this.language,
        localNotifications: this.localNotifications,
        remoteNotifications: this.remoteNotifications
      }
    });
  }
}
