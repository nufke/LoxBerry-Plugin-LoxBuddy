import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, debounceTime } from 'rxjs';
import { SHA256, enc } from 'crypto-js';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { NotificationMessage, ToastMessage, MessagingSettings, Settings } from '../interfaces/data.model';
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
  private messagingToken = null;
  private settings: Settings;
  private showedToastUid : string = '';

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
      if (!settings && !settings.app && !settings.messaging) return; // no valid input
      this.settings = settings;
      this.localNotifications = settings.app.localNotifications; 
      this.localNotifications ? this.registerLocalNotifications() : this.unregisterLocalNotifications();
      this.remoteNotifications = settings.app.remoteNotifications;
      this.remoteNotifications ? this.registerCloudNotifications(settings.messaging) : this.unregisterCloudNotifications();
    });
  }

  toBackground() {
    this.swBackgroundNotification(true);
  }

  toForeground() {
    this.swBackgroundNotification(false);
  }

  private async unregisterCloudNotifications() {
    /*
    if (!this.messagingToken) return; // no token, so no unregistration required
    console.log('unregisterCloudNotifications...');
    navigator.serviceWorker.getRegistrations().then( serviceWorkerRegistration => {
      return Promise.all(serviceWorkerRegistration.map(reg => reg.unregister()));
    });
    this.sendToken(this.messagingToken, [], true); // clear ids
    this.messagingToken = null;
    */
  }

  private swBackgroundNotification(state) {
    navigator.serviceWorker.ready.then( registration => {
      registration.active.postMessage( {type: 'STATE', background: state} );
    });
  }

  private updateToken(data: MessagingSettings, ids: string[], fcmToken: string) {
    const url = data.url + '/updatetoken';
    const headers = { 
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + data.key,
      "id": ids[0]
    };
    const method = 'POST';
    const appId = this.settings.app.id;
    console.log('updatetoken:', appId, fcmToken);
    return fetch(url, {
      method: method,
      headers: headers,
      body: JSON.stringify({ [appId]: fcmToken })
    })  
  }

  private sendToken(ids) {
    let cmd = { 
      messagingService: {
        appId: this.settings.app.id,
        url: new URL(window.location.href).origin,
        ids: ids
      }
    };
    this.loxberryService.sendCommand(cmd);
  }

  private generateIds(ids: string[]) {
    return ids.map( id => { return SHA256(id).toString(enc.Hex); })
  }

  private async registerCloudNotifications(data: MessagingSettings) {
    console.log('token: ', this.messagingToken);
    let ids = this.generateIds(this.dataService.getDevices());  
    if (!ids[0]) return; // no valid ids
    if (this.messagingToken) { // token already available, send to LoxBuddy Server
      console.log('token already exists. done');
      //this.updateToken(data, ids, this.messagingToken);
      this.sendToken(ids);
      return; 
    }
    console.log('registerCloudNotifications...', ids[0]);
    const url = data.url + '/config';
    const headers = { 
      "Content-Type": "application/json", 
      "Authorization": "Bearer " + data.key,
      "id": ids[0]
    };

    fetch(url, {headers} )
      .then((response) => response.json())
      .then((json) => {

      const firebaseConfig = json.message.firebase;
      const vapidKey = json.message.fcm.vapidKey;
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
            this.messagingToken = val;
            this.updateToken(data, ids, this.messagingToken);
            this.sendToken(ids);
            console.log("LoxBuddy Messaging Service registration successful");
          }).catch(err => {
            console.log('getToken error:', err); 
          });

        onMessage(messaging, (payload) => {
          console.log('Push Message received in foreground: ', payload);
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
        navigator.serviceWorker.ready.then( (registration) => {
          // Initialize messageChannelPort
          const messageChannel = new MessageChannel();
          registration.active.postMessage({type: 'SW_PORT_INITIALIZATION'}, 
            [messageChannel.port2 ]);
          registration.active.postMessage({type: 'FIREBASE_CONFIG', config: firebaseConfig});
            
          // listen to messages coming from service-worker
          messageChannel.port1.onmessage = (event) => {
            if (event.data && event.data.type === 'FIREBASE_NOTIFICATION') {
              console.log('notification received: ' , event.data.message);
            }
          };
       });
      } else {
        console.log('messaging NULL');
      } 
    })
    .catch(error => {
      console.log("LoxBuddy Messaging Service registration not successful: " + JSON.stringify(error));
    });
  }

  private async registerLocalNotifications() {
    if (this.dataSubscription) return; // already registered
    this.dataSubscription = this.dataService.notifications$.subscribe( notifications => {
      if (!notifications || notifications.length==0) return; // no valid notification
      let msg : NotificationMessage = notifications[0]; // TODO define order
      let msgToast : ToastMessage = {
        title: msg.title,
        message: msg.message,
        ts: Number(msg.ts),
        url: '/notifications'
      };
      
      //console.log('notification:', msg);
      // only show notification(s) received the last 5 minutes
      if (this.localNotifications && msg && msg.uid && (msg.uid != this.showedToastUid) 
        && Number(msg.ts) > moment().unix()-5*60) {
        if (this.isToastOpen) {
          this.closeToast();
          msgToast = this.createNotificationMessage(notifications.length)
        } 
        this.showedToastUid = msg.uid;
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
    this.showedToastUid = '';
    this.toast.dismiss();
    this.toast = undefined;
  }

}
