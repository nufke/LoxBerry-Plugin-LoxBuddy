import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MqttService, MqttConnectionState } from 'ngx-mqtt';
import { StorageService } from '../../services/storage.service';
import packageJson from '../../../../package.json';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage
  implements OnInit, OnDestroy {

  Pages = [
    {
      title: 'Home',
      url: '/app/home',
      icon: 'home-outline'
    },
    {
      title: 'Rooms',
      url: '/app/room',
      icon: 'grid-sharp'
    },
    {
      title: 'Categories',
      url: '/app/category',
      icon: 'list-sharp'
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: 'settings-outline'
    },
    {
      title: 'About',
      url: '/about',
      icon: 'information-circle-outline'
    }
  ];

  darkTheme: boolean = true; // default if not set
  language: string;
  version: string;
  status: string;

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
        this.darkTheme = settings.app.dark_theme;
        document.body.classList.toggle('dark', this.darkTheme);
        this.language = settings.app.language;
        this.translate.use(this.language);
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

  setLanguage(lang: string) {
    this.language = lang;
    this.translate.use(lang);
    this.saveMenuSettings();
  }

  private saveMenuSettings() {
    this.storageService.saveSettings(
      {
        app: {
          dark_theme: this.darkTheme,
          language: this.language
        }
      });
  }
}
