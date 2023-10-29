import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { NotificationMessage } from '../interfaces/data.model';
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
  private enableNotifications: boolean = false;
  private isToastOpen = false;
  private toast: any = undefined;

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
      if (settings && settings.app) {
        this.enableNotifications = settings.app.enableNotifications;
      }
    });
    this.monitorNotifications();
  }

  private async monitorNotifications() {
    this.dataService.notifications$.subscribe( notifications => {
      let msg = notifications[0]; // first entry is newest

      // only show notification(s) received the last 5 minutes
      if (this.enableNotifications && msg && msg.uid && msg.ts > moment().unix()-5*60) {
        if (this.isToastOpen) {
          this.closeToast();
          msg = this.createNotificationMessage(notifications.length)
        }
        this.showNotification(msg);
      }

      // show notification summary 
      if (this.enableNotifications && msg && msg.uids && msg.uids.length > 1) {
        if (this.isToastOpen) {
          this.closeToast();
        }
        msg = this.createNotificationMessage(msg.uids.length);
        this.showNotification(msg);
      }
    });
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

  private async showNotification(msg) {
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
