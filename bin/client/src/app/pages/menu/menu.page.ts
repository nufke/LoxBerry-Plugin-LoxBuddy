import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MqttService, MqttConnectionState } from 'ngx-mqtt';
import { StorageService } from '../../services/storage.service';
import packageJson from '../../../../package.json';
import { AppSettings } from '../../interfaces/data.model';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit, OnDestroy {

  Pages = [
    {
      title: 'MQTT configuration',
      url: 'app/mqtt',
      icon: 'assets/icons/svg/mqtt.svg'
    },
    {
      title: 'Settings',
      url: 'app/settings',
      icon: 'svg/settings-outline.svg'
    },
    {
      title: 'Notifications',
      url: 'app/notifications',
      icon: 'svg/reader-outline.svg'
    },
    {
      title: 'About',
      url: 'app/about',
      icon: 'svg/information-circle-outline.svg'
    }
  ];

  darkTheme: boolean; 
  version: string;
  status: string;
  appSettings: AppSettings
  language: string;

  private storageSubscription: Subscription;
  private serviceSubscription: Subscription;

  constructor(
    private storageService: StorageService,
    public translate: TranslateService,
    private mqttService: MqttService )
  {
    this.storageSubscription = this.storageService.settings$.subscribe( settings =>
    {
      if (settings && settings.app) {
        this.darkTheme = settings.app.darkTheme;
        document.body.classList.toggle('dark', this.darkTheme);
        this.language = settings.app.language;
        this.translate.use(this.language);
        this.appSettings = settings.app; // read all other app settings which are not used here
      }
    });

    this.serviceSubscription = this.mqttService.state.subscribe((state: MqttConnectionState) => {
      let connectionStatus = (state === MqttConnectionState.CONNECTED);
      this.status = connectionStatus ? 'Connected' : 'Disconnected';
    });

    this.version = packageJson.version;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.storageSubscription.unsubscribe();
    this.serviceSubscription.unsubscribe();
  }

  onToggleDarkTheme() {
    document.body.classList.toggle('dark', this.darkTheme);
    this.saveMenuSettings();
  }

  private saveMenuSettings() {
    this.storageService.saveSettings(
      {
        app: { 
          ...this.appSettings,
          darkTheme: this.darkTheme
        }
      });
  }
}
