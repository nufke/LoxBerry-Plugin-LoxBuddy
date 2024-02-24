import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NotificationMessage, ToastMessage } from '../interfaces/data.model';
import { SoundService } from '../services/sound.service';
import { StorageService } from './storage.service';
import { DataService } from './data.service';
import * as moment from 'moment';

var sprintf = require('sprintf-js').sprintf;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private toastShadowParts;
  private localNotifications: boolean = false;
  private isToastOpen = false;
  private toast: any = undefined;
  private dataSubscription: Subscription = undefined;
  private showedToastUid : string = '';

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private soundService: SoundService,
    private dataService: DataService,
    private storageService: StorageService) {

    this.toastShadowParts = {
      button: 'button',
      '.toast-button-time': 'button-time',
      '.toast-container': 'container',
      '.toast-content': 'content',
      '.toast-header': 'header',
      '.toast-message': 'message'
    }

    this.storageService.settings$.subscribe( settings => {
      if (!settings && !settings.app) return; // no valid input
      this.localNotifications = settings.app.localNotifications; 
      this.localNotifications ? this.registerLocalNotifications() : this.unregisterLocalNotifications();
    });
  }

  public showNotification(msg : NotificationMessage, url: string) {
    let msgToast : ToastMessage = {
      title: msg.title,
      message: msg.message,
      ts: Number(msg.ts),
      url: url
    };

    // only show notification(s) not older than 1 minute
    if (this.localNotifications && msg && msg.uid && (msg.uid != this.showedToastUid) 
        && Number(msg.ts) > moment().unix()-60) { 
      this.showedToastUid = msg.uid;
      this.showNotificationToast(msgToast);
    }

    // show notification summary
    if (this.localNotifications && msg && msg.uids && msg.uids.length > 1) {
      msgToast = this.createNotificationMessage(msg.uids.length);
      this.showNotificationToast(msgToast);
    }
  }

  private async registerLocalNotifications() {
    if (this.dataSubscription) return; // already registered
    this.dataSubscription = this.dataService.notifications$.subscribe( notifications => {
      if (!notifications || notifications.length==0) return; // no valid notification
      let msg : NotificationMessage = notifications[0]; // TODO define order
      this.showNotification(msg, '/notifications');
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
    if (this.isToastOpen) {
      this.closeToast();
    }
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
