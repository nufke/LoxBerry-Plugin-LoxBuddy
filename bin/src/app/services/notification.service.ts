import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { NotificationMessage } from '../interfaces/data.model';
import { SoundService } from '../services/sound.service';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private _notifications$ = new BehaviorSubject<NotificationMessage[]>([]);
  private notificationList: NotificationMessage[] = [];

  toastShadowParts;

  constructor(
    private toastController: ToastController,
    private navCtrl: NavController,
    private translate: TranslateService,
    private soundService: SoundService) {

    this.toastShadowParts = {
      button: 'button',
      '.toast-button-time': 'button-time',
      '.toast-container': 'container',
      '.toast-content': 'content',
      '.toast-header': 'header',
      '.toast-message': 'message'
    }
  }

  get notifications$(): Observable<NotificationMessage[]> {
    return this._notifications$.asObservable();
  }

  storeNotification(msg) {
    if ( this.notificationList &&
         msg.uid && 
         !this.notificationList.find( item => item.uid == msg.uid )) {
      this.notificationList.push(msg);
      this.showNotification(msg);
      this._notifications$.next(this.notificationList);

      this.soundService.play('notification');
    }
  }

  async showNotification(msg) {
    const toast = await this.toastController.create({
      cssClass: 'notifications-toast',
      buttons: [
        {
          side: 'start',
          role: 'time',
          text: moment(msg.ts*1000).locale(this.translate.currentLang).format('LT'),
          handler: () => {
            this.navCtrl.navigateForward('/messages')
          }
        },
        {
          side: 'start',
          role: 'message',
          text: msg.title + '\n' + msg.message,
          handler: () => {
            this.navCtrl.navigateForward('/messages')
          }
        },
        {
          side: 'end',
          icon: 'close',
        },
      ],
    });

    // workaround to get access to shadow-root DOM via user-defined parts
    // https://github.com/ionic-team/ionic-framework/pull/20146
    this.setToastShadowParts(toast);

    await toast.present();
  }
  
  setToastShadowParts(toast) {
    Object.entries(this.toastShadowParts).forEach(([selector, part]) => {
      const el = toast.shadowRoot.querySelector(selector)
        if (el) {
        el.setAttribute('part', part)
      }
    })
  }
}
