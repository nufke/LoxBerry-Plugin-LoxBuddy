import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { NotificationMessage, MessagingSettings, Settings } from '../interfaces/data.model';
import { SHA256, enc } from 'crypto-js';
import { LoxBerryService } from '../services/loxberry.service'
import { DataService } from './data.service';
import { StorageService } from './storage.service'
import { NotificationService } from './notification.service'

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  private messagingToken = null;
  private settings: Settings;
  private remoteNotifications: boolean = false;

  constructor(
    private loxberryService: LoxBerryService,
    private dataService: DataService,
    private storageService: StorageService,
    private notificationService: NotificationService)
  {
    this.storageService.settings$.subscribe( settings => {
      if (!settings && !settings.app && !settings.messaging) return; // no valid input
      this.settings = settings;
      this.remoteNotifications = settings.app.remoteNotifications;
      this.remoteNotifications ? this.registerCloudNotifications(settings.messaging) : this.unregisterCloudNotifications();
    });
  }

  toBackground() {
    this.swForeGroundNotification(false);
  }

  toForeground() {
    this.swForeGroundNotification(true);
  }

  private swForeGroundNotification(state) {
    navigator.serviceWorker.ready.then( registration => {
      registration.active.postMessage( {type: 'STATE', foreground: state} );
    });
  }

  private generateIds(ids: string[]) {
    return ids.map( id => { return SHA256(id).toString(enc.Hex); })
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
              console.log('notification received in background: ' , event.data.message);
            }
          };
          // startup in foreground mode
          this.swForeGroundNotification(true); 
        });

        onMessage(messaging, (payload) => {
          console.log('Push Message received in foreground: ', payload);
          let msg : NotificationMessage = {
            uid: payload.data.uid,
            ts: payload.data.ts,
            title: payload.data.title,
            message: payload.data.message,
            type: payload.data.type,
            mac: payload.data.mac,
            lvl: payload.data.lvl,
            uuid: payload.data.uuid,
          };
          const rootUrl = new URL(window.location.href).origin;
          const url = payload.data.click_action.replace(rootUrl, '');
          this.dataService.storeNotification(msg);
          this.notificationService.showNotification(msg, url);
        });
      } else {
        console.log('messaging NULL');
      } 
    })
    .catch(error => {
      console.log("LoxBuddy Messaging Service registration not successful: " + JSON.stringify(error));
    });
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

}
