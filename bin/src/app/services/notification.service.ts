import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { NotificationMessage, PushMessagingService, Settings } from '../interfaces/data.model';
import { SoundService } from '../services/sound.service';
import { LoxBerryService } from '../services/loxberry.service'
import { StorageService } from './storage.service'
import { DataService } from './data.service';
import * as moment from 'moment';

var sprintf = require('sprintf-js').sprintf;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private toastShadowParts;
  private localNotifications: boolean = false;
  private remoteNotifications: boolean = false;
  private isToastOpen = false;
  private toast: any = undefined;
  private dataSubscription: Subscription = undefined;
  private pmsToken = null;
  private cloudRegistered = false;
  private settings: Settings;

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private soundService: SoundService,
    private dataService: DataService,
    private storageService: StorageService,
    private loxberryService: LoxBerryService) {

    this.toastShadowParts = {
      button: 'button',
      '.toast-button-time': 'button-time',
      '.toast-container': 'container',
      '.toast-content': 'content',
      '.toast-header': 'header',
      '.toast-message': 'message'
    }

    this.storageService.settings$.subscribe( async settings => {
      if (!settings && !settings.app && !settings.messagingService) return; // no valid input

      this.settings = settings;

      if (this.localNotifications !== settings.app.localNotifications) {
        this.localNotifications = settings.app.localNotifications; 
        this.localNotifications ? this.registerLocalNotifications() : this.unregisterLocalNotifications();
      }

      if (this.remoteNotifications !== settings.app.remoteNotifications) {
        this.remoteNotifications = settings.app.remoteNotifications;
        const message: PushMessagingService = settings.messagingService;
        const messageValid = message && (message.url.length * message.id.length * message.key.length) > 0;

        if (this.remoteNotifications && !this.cloudRegistered && messageValid) {
          this.cloudRegistered = true;
          await this.registerCloudNotifications(message);
        }

        if (!this.remoteNotifications && this.cloudRegistered) {
          await this.unregisterCloudNotifications();
          this.cloudRegistered = false;
        }
      }
    });
  }

  private async unregisterCloudNotifications() {
    if (!this.pmsToken) return; // no token, so no unregistration required
    console.log('unregisterCloudNotifications...');
    navigator.serviceWorker.getRegistrations().then( serviceWorkerRegistration => {
      return Promise.all(serviceWorkerRegistration.map(reg => reg.unregister()));
    });
    if (this.pmsToken) {
      let cmd = { 
        messagingService: {
          appId: this.settings.app.id,
          url: new URL(window.location.href).origin,
          token: this.pmsToken,
          ids: []
        }
      };
      this.loxberryService.sendCommand(cmd);
      this.pmsToken = null;
    }
  }
  
  private async registerCloudNotifications(data: PushMessagingService) {
    if (this.pmsToken) return; // token, so no registration required
    console.log('registerCloudNotifications...');
    const url = data.url + '/api/v1/config'
    const headers = { 
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + data.key,
      "id": data.id
    };

    fetch(url, {headers} )
      .then((response) => response.json())
      .then((json) => {

      const firebaseConfig = json.config.firebase;
      const vapidKey = json.config.vapidKey;
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      if (messaging) {
        navigator.serviceWorker.register('firebase-messaging-sw.js', { type: 'module' }).
          then(serviceWorkerRegistration =>
            getToken(messaging, {
              serviceWorkerRegistration,
              vapidKey: vapidKey,
            })
          ).then( val => {
            this.pmsToken = val;
            let ids = this.dataService.getDevices();
            let cmd = { 
              messagingService: {
                appId: this.settings.app.id,
                url: new URL(window.location.href).origin,
                token: val,
                ids: ids
              }
            };
            // only send if we have devices (otherwise Lox2MQTT will delete the devices)
            if (ids.length) {
              this.loxberryService.sendCommand(cmd);
              //console.log('pmsInfo:', cmd);
            }
          });

        onMessage(messaging, (payload) => {
          console.log('Push Message received. ', payload);
          if (this.isToastOpen) {
            this.closeToast();
          }
          this.showNotificationToast({ 
            title: payload.data.title,
            message: payload.data.message,
            ts: payload.data.ts,
            type: payload.data.type,
            uid: payload.data.uid,
          });
        });
        // send Firebase configuration to service worker
        navigator.serviceWorker.ready.then( registration => {
          registration.active.postMessage( {type: 'FIREBASE_CONFIG', config: firebaseConfig} );
        });
      } else {
        console.log('messaging NULL');
      } 
    })
    .catch(error => {
      console.log("Push Messaging Service registration not successful: " + JSON.stringify(error));
    });
  }

  private async registerLocalNotifications() {
    if (this.dataSubscription) return; // already registered
    this.dataSubscription = this.dataService.notifications$.subscribe( notifications => {
      let msg = notifications[0]; // first entry is newest

      // only show notification(s) received the last 5 minutes
      if (msg && msg.uid && msg.ts > moment().unix()-5*60) {
        if (this.isToastOpen) {
          this.closeToast();
          msg = this.createNotificationMessage(notifications.length)
        }
        this.showNotificationToast(msg);
      }

      // show notification summary 
      if (this.localNotifications && msg && msg.uids && msg.uids.length > 1) {
        if (this.isToastOpen) {
          this.closeToast();
        }
        msg = this.createNotificationMessage(msg.uids.length);
        this.showNotificationToast(msg);
      }
    });
  }

  private async unregisterLocalNotifications() {
    if (!this.dataSubscription) return;
    this.dataSubscription.unsubscribe();
    this.dataSubscription = undefined;
  }

  private createNotificationMessage(count: number) : NotificationMessage {
    return { 
      title: sprintf(this.translate.instant('You received %s notifications'), count),
      message: '',
      ts: 0,
      type: 10,
      uid: ''
    };
  }

  private async showNotificationToast(msg) {
    this.toast = await this.toastController.create({
      cssClass: 'notifications-toast',
      buttons: [
        {
          side: 'start',
          role: 'time',
          text: msg.ts ? moment(msg.ts*1000).locale(this.translate.currentLang).format('LT') : '',
          handler: () => {
            this.navCtrl.navigateForward('/notifications')
          }
        },
        {
          side: 'start',
          role: 'message',
          text: msg.title + '\n' + msg.message,
          handler: () => {
            this.navCtrl.navigateForward('/notifications')
          }
        },
        {
          side: 'end',
          icon: 'close',
          handler: () => {
            this.closeToast()
          }
        },
      ],
    });

    // workaround to get access to shadow-root DOM via user-defined parts
    // https://github.com/ionic-team/ionic-framework/pull/20146
    this.setToastShadowParts(this.toast);
    this.isToastOpen = true;
    await this.toast.present();
    this.soundService.play('notification');
  }
  
  private setToastShadowParts(toast) {
    Object.entries(this.toastShadowParts).forEach(([selector, part]) => {
      const el = toast.shadowRoot.querySelector(selector)
        if (el) {
        el.setAttribute('part', part)
      }
    })
  }

  private closeToast() {
    this.isToastOpen = false;
    this.toast.dismiss();
    this.toast = undefined;
  }

}
