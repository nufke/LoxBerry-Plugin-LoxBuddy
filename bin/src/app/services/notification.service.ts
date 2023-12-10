import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, combineLatest } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { NotificationMessage, PushMessagingService } from '../interfaces/data.model';
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
  private FCMToken = null;

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private soundService: SoundService,
    private dataService: DataService,
    private storageService: StorageService,
    private loxberryService: LoxBerryService) {

    // TODO workarond to load default serviceworker
    // since the combined-sw.js is not working on each platform
    //navigator.serviceWorker.register('ngsw-worker.js');

    this.toastShadowParts = {
      button: 'button',
      '.toast-button-time': 'button-time',
      '.toast-container': 'container',
      '.toast-content': 'content',
      '.toast-header': 'header',
      '.toast-message': 'message'
    }

    combineLatest([
      this.storageService.settings$,
      this.dataService.globalStates$
    ]).subscribe( ([settings, globalStates]) => {
      if (!settings && !settings.app && !globalStates) return; // no valid input

      if (this.localNotifications !== settings.app.localNotifications) {
        this.localNotifications ? this.registerLocalNotifications() : this.unregisterLocalNotifications();
        this.localNotifications = settings.app.localNotifications;  
      }

      let message: PushMessagingService;
      if (globalStates[0] && globalStates[0].messagingService) {
        message = globalStates[0].messagingService;
      }

      const messageValid = message && (message.url.length * message.id.length * message.key.length) > 0;
      if ((this.remoteNotifications !== settings.app.remoteNotifications)) {
        if (messageValid) {
          this.remoteNotifications ? this.registerCloudNotifications(message) : this.unregisterCloudNotifications();
        }
        this.remoteNotifications = settings.app.remoteNotifications;
      }
    });
  }

  private async unregisterCloudNotifications() {
    console.log('FCM unregistered');
    navigator.serviceWorker.getRegistrations().then( serviceWorkerRegistration => {
      return Promise.all(serviceWorkerRegistration.map(reg => reg.unregister()));
    });
    if (this.FCMToken) {
      const cmd = {
        pms: { 
          serialnr: this.dataService.getDevices(),
          token: this.FCMToken,
          valid: false
        }
      }
      this.loxberryService.sendCommand(cmd);
      this.FCMToken = null;
    }
  }
  
  private async registerCloudNotifications(data: PushMessagingService) {
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
            const cmd = {
              pms: { 
                serialnr: this.dataService.getDevices(),
                token: val,
                valid: true
              }
            }
            this.FCMToken = val;
            this.loxberryService.sendCommand(cmd);
          });

        onMessage(messaging, (payload) => {
          console.log('Push Message received. ', payload);
          const msg = { 
            title: payload.notification.title,
            message: payload.notification.body,
            ts: Date.now()/1000,
            type: 10,
            uid: payload.messageId,
          }
          this.showNotificationToast(msg);
        });
 
        // send Firebase configuration to service worker
        navigator.serviceWorker.ready.then( registration => {
          registration.active.postMessage( { url: data.url, headers: headers} );
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
