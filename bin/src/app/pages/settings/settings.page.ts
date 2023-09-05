import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController, IonRouterOutlet } from '@ionic/angular';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { NavController } from '@ionic/angular';
import { MqttSettings, INITIAL_MQTT_SETTINGS } from '../../interfaces/data.model';
import { TranslateService } from '@ngx-translate/core';

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

  public MQTTAddressLabel: string;
  public MQTTWebsocketLabel: string;
  public MQTTUsernameLabel: string;
  public MQTTPasswordLabel: string;

  constructor(
    public translate: TranslateService,
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
      mqtt_topic: ['', Validators.required],
    });

    this.MQTTAddressLabel = 'MQTT server IP ' + this.translate.instant('Address').toLowerCase();
    this.MQTTWebsocketLabel = 'MQTT server websocket ' + this.translate.instant('Port').toLowerCase();
    this.MQTTUsernameLabel = 'MQTT server ' + this.translate.instant('Username').toLowerCase();
    this.MQTTPasswordLabel = 'MQTT server ' + this.translate.instant('Password').toLowerCase();
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

    this.storageService.settings$.subscribe(settings => {
      if (settings && settings.mqtt) {
        this.updateForm(settings.mqtt);
      }
    });
  }

  async updateForm(settings: MqttSettings) {
    if (settings) {
      if (settings.hostname) this.mqttSettingsForm.hostname = settings.hostname;
      if (settings.port) this.mqttSettingsForm.port = settings.port;
      if (settings.username) this.mqttSettingsForm.username = settings.username;
      if (settings.password) this.mqttSettingsForm.password = settings.password;
      if (settings.topic) this.mqttSettingsForm.topic = settings.topic;

      if (this.mqttForm) {
        this.mqttForm.setValue({
          'mqtt_hostname': this.mqttSettingsForm.hostname,
          'mqtt_port': this.mqttSettingsForm.port,
          'mqtt_username': this.mqttSettingsForm.username,
          'mqtt_password': this.mqttSettingsForm.password,
          'mqtt_topic': this.mqttSettingsForm.topic
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
        topic: mqttSettings.topic,
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
      topic: ''
    });
    this.storageService.cleanStorage();
  }

  private async processFields(mqttForm: FormGroup): Promise<MqttSettings> {
    let hostname: string = mqttForm.value.mqtt_hostname;
    let port: number = mqttForm.value.mqtt_port;

    if (hostname.includes("http://")) {           // check if user added prefix
      hostname = hostname.replace('http://', ''); // remove http from IP
    }

    if (hostname.match(":[0-9]{4,6}")) {     // check if user added port
      port = Number(hostname.split(':')[1]); // if given, override port
      hostname = hostname.split(':')[0];     // remove port from IP address
    }

    return ({
      hostname: hostname,
      port: port,
      username: mqttForm.value.mqtt_username,
      password: mqttForm.value.mqtt_password,
      topic: mqttForm.value.mqtt_topic
    });
  }

  ngOnDestroy() {
    this.routerEvents.unsubscribe();
  }

}
