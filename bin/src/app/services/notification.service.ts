import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { NotificationMessage, MessagingSettings } from '../interfaces/data.model';
import { SoundService } from '../services/sound.service';
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

  private cloudRegistered = false;
  private dataSubscription: Subscription = undefined;

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private soundService: SoundService,
    private storageService: StorageService,
    private dataService: DataService) {

    this.toastShadowParts = {
      button: 'button',
      '.toast-button-time': 'button-time',
      '.toast-container': 'container',
      '.toast-content': 'content',
      '.toast-header': 'header',
      '.toast-message': 'message'
    }

    this.storageService.settings$.subscribe( settings =>
    {
      if (settings && settings.app && settings.messaging) {
        this.localNotifications = settings.app.localNotifications;
        this.remoteNotifications = settings.app.remoteNotifications;

        if (this.remoteNotifications && !this.cloudRegistered) {
          this.cloudRegistered = true;
          this.registerCloudNotifications(settings.messaging);
        }

        if (!this.remoteNotifications && this.cloudRegistered) {
          this.cloudRegistered = false;
          this.unregisterCloudNotifications();
        }

        if (this.localNotifications) {
          this.registerLocalNotifications();
        } else {
          this.unregisterLocalNotifications();
        }
      }
    });
  }

  private async unregisterCloudNotifications() {
    console.log('FCM unregistered');
    navigator.serviceWorker.getRegistrations().then( serviceWorkerRegistration => {
      return Promise.all(serviceWorkerRegistration.map(reg => reg.unregister()));
    });
  }
  
  private async registerCloudNotifications(settings: MessagingSettings) {

    const headers = { "Content-Type": "application/json", ...settings.headers };

    fetch(settings.url, {headers} )
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
          ).then( val => console.log('FCM token:', {val}));

        onMessage(messaging, (payload) => {
          console.log('Message received. ', payload);
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
          registration.active.postMessage( { url: settings.url, headers: headers} );
        });

      } else {
        console.log('messaging NULL');
      }
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
