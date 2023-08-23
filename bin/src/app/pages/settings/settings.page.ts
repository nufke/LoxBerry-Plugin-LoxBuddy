import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, IonRouterOutlet } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { NavController } from '@ionic/angular';
import { MqttSettings, INITIAL_MQTT_SETTINGS } from '../../interfaces/data.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit, OnDestroy {
  mqttForm: FormGroup;
  mqttSettingsForm: MqttSettings = INITIAL_MQTT_SETTINGS;
  previousUrl: string;
  canGoBack: boolean;

  private routerEvents: any;
  private currentUrl: string;
  private action: string;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private router: Router,
    private loadingController: LoadingController,
    private storageService: StorageService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private ionRouterOutlet: IonRouterOutlet
  ) {
    this.mqttForm = this.fb.group({
      mqtt_hostname: ['', Validators.required],
      mqtt_port: ['', Validators.required],
      mqtt_username: ['', Validators.required],
      mqtt_password: ['', Validators.required],
      mqtt_app_topic: ['', Validators.required],
      mqtt_ms_topic: ['', Validators.required]
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

    // TODO Check action
    // this.action = this.route.snapshot.paramMap.get('action');
    // if (this.action === 'logout') this.logout();

    this.storageService.settings$.subscribe(settings => {
      if (settings && settings.mqtt)
        this.updateForm(settings.mqtt);
    });
  }

  async updateForm(settings: MqttSettings) {
    if (settings) {
      if (settings.hostname) this.mqttSettingsForm.hostname = settings.hostname;
      if (settings.port) this.mqttSettingsForm.port = settings.port;
      if (settings.username) this.mqttSettingsForm.username = settings.username;
      if (settings.password) this.mqttSettingsForm.password = settings.password;
      if (settings.app_topic) this.mqttSettingsForm.app_topic = settings.app_topic;
      if (settings.ms_topic) this.mqttSettingsForm.ms_topic = settings.ms_topic;

      if (this.mqttForm) {
        this.mqttForm.setValue({
          'mqtt_hostname': this.mqttSettingsForm.hostname,
          'mqtt_port': this.mqttSettingsForm.port,
          'mqtt_username': this.mqttSettingsForm.username,
          'mqtt_password': this.mqttSettingsForm.password,
          'mqtt_app_topic': this.mqttSettingsForm.app_topic,
          'mqtt_ms_topic': this.mqttSettingsForm.ms_topic
        });
      }
    }
  }

  async saveSettings() {
    const loading = await this.loadingController.create({
      cssClass: 'spinner',
      spinner: 'crescent',
      message: 'Please wait...'
    });

    await loading.present();
    let mqttSettings = await this.processFields(this.mqttForm);

    await this.storageService.saveSettings({
      mqtt: {
        hostname: mqttSettings.hostname,
        port: mqttSettings.port,
        username: mqttSettings.username,
        password: mqttSettings.password,
        app_topic: mqttSettings.app_topic,
        ms_topic: mqttSettings.ms_topic
      }
    });

    await loading.dismiss();
    this.navCtrl.navigateRoot('');

  }

  cancel() {
    this.navCtrl.navigateRoot('');
  }

  async reset() {
    await this.updateForm({
      hostname: '',
      port: null,
      username: '',
      password: '',
      app_topic: '',
      ms_topic: ''
    });
    this.storageService.cleanStorage();
  }

  private async processFields(mqttForm: FormGroup): Promise<MqttSettings> {
    let hostname: string = mqttForm.value.mqtt_hostname;
    let port: number = mqttForm.value.mqtt_port;

    if (hostname.includes("http://")) {    // check if user added prefix
      hostname = hostname.replace('http://', '');     // remove http from IP
    }

    if (hostname.match(":[0-9]{4,6}")) {   // check if user added port
      port = Number(hostname.split(':')[1]); // if given, override port
      hostname = hostname.split(':')[0]; // remove port from IP address
    }

    return ({
      hostname: hostname,
      port: port,
      username: mqttForm.value.mqtt_username,
      password: mqttForm.value.mqtt_password,
      app_topic: mqttForm.value.mqtt_app_topic,
      ms_topic: mqttForm.value.mqtt_ms_topic
    });
  }

  ngOnDestroy() {
    this.routerEvents.unsubscribe();
  }

}
