import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, debounceTime } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { NotificationMessage, ToastMessage, PMSSettings, Settings } from '../interfaces/data.model';
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
  private settings: Settings;
  private showedToastUid;

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

    this.storageService.settings$.subscribe( settings => {
      if (!settings && !settings.app && !settings.pms) return; // no valid input
      this.settings = settings;
      this.localNotifications = settings.app.localNotifications; 
      this.localNotifications ? this.registerLocalNotifications() : this.unregisterLocalNotifications();
      this.remoteNotifications = settings.app.remoteNotifications;
      this.remoteNotifications ? this.registerCloudNotifications(settings.pms) : this.unregisterCloudNotifications();
    });
  }

  private sendToken(token, ids, forceWrite = false) {
    let cmd = { 
      messagingService: {
        appId: this.settings.app.id,
        url: new URL(window.location.href).origin,
        token: token,
        ids: ids
      }
    };
    // only send if we have devices (otherwise Lox2MQTT will delete the devices)
    if (ids.length || forceWrite) {
      this.loxberryService.sendCommand('/settings/cmd', cmd);
    }
  }

  private async unregisterCloudNotifications() {
    if (!this.pmsToken) return; // no token, so no unregistration required
    console.log('unregisterCloudNotifications...');
    navigator.serviceWorker.getRegistrations().then( serviceWorkerRegistration => {
      return Promise.all(serviceWorkerRegistration.map(reg => reg.unregister()));
    });
    this.sendToken(this.pmsToken, [], true); // clear ids
    this.pmsToken = null;
  }

  private async registerCloudNotifications(data: PMSSettings) {
    let ids = this.dataService.getDevices();
    if (this.pmsToken) { // token available, send to lox2mqtt
      this.sendToken(this.pmsToken, ids);
      return; 
    }
    console.log('registerCloudNotifications...');
    const url = data.url + '/config'
    const headers = { 
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + data.key,
      "id": data.id
    };

    fetch(url, {headers} )
      .then((response) => response.json())
      .then((json) => {

      const firebaseConfig = json.message.firebase;
      const vapidKey = json.message.vapidKey;
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
            this.sendToken(val, ids);
          }).catch(err => {
            console.log('getToken error:', err); 
          });

        onMessage(messaging, (payload) => {
          console.log('Push Message received. ', payload);
          // if notification is already showed, cancel 
          if (payload.data.uid == this.showedToastUid) return;
          if (this.isToastOpen) {
            this.closeToast();
          }
          this.showedToastUid = payload.data.uid;
          const rootUrl = new URL(window.location.href).origin;
          const url = payload.data.click_action.replace(rootUrl,'');
          this.showNotificationToast({ 
            title: payload.data.title,
            message: payload.data.message,
            ts: Number(payload.data.ts),
            url: url
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
      let msg : NotificationMessage = notifications[0]; // TODO define order
      let msgToast : ToastMessage;

      // only show notification(s) received the last 5 minutes
      if (msg && msg.uid && (msg.uid != this.showedToastUid) 
              && msg.ts > moment().unix()-5*60) {
        if (this.isToastOpen) {
          this.closeToast();
          msg.uid = this.showedToastUid;
          msgToast = this.createNotificationMessage(notifications.length)
        }
        this.showNotificationToast(msgToast);
      }

      // show notification summary 
      if (this.localNotifications && msg && msg.uids && msg.uids.length > 1) {
        if (this.isToastOpen) {
          this.closeToast();
        }
        msgToast = this.createNotificationMessage(msg.uids.length);
        this.showNotificationToast(msgToast);
      }
    });
  }

  private async unregisterLocalNotifications() {
    if (!this.dataSubscription) return;
    this.dataSubscription.unsubscribe();
    this.dataSubscription = undefined;
  }

  private createNotificationMessage(count: number) : ToastMessage {
    return { 
      title: sprintf(this.translate.instant('You received %s notifications'), count),
      message: '',
      ts: 0,
      url: '/notifications'
    };
  }

  private async showNotificationToast(msg : ToastMessage) {
    this.toast = await this.toastController.create({
      cssClass: 'notifications-toast',
      buttons: [
        {
          side: 'start',
          role: 'time',
          text: msg.ts ? moment(msg.ts*1000).locale(this.translate.currentLang).format('LT') : '',
          handler: () => {
            this.navCtrl.navigateForward(msg.url)
          }
        },
        {
          side: 'start',
          role: 'message',
          text: msg.title + '\n' + msg.message,
          handler: () => {
            this.navCtrl.navigateForward(msg.url)
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
