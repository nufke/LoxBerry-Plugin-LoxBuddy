import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LockPage } from '../pages/lock/lock.page';
import { StorageService } from './storage.service'
import { AppSettings } from '../interfaces/data.model'

const TYPE_FINGER = 'finger';

@Injectable()
export class LockscreenService {
  authType: string = '';
  options;

  constructor(private modalCtrl: ModalController,
              private storageService: StorageService) {

    this.storageService.settings$.subscribe(settings => {
      if (settings && settings.app) {
        this.options = {
          pin: settings.app.pin ? settings.app.pin : '0000',
          enableBiometricId: settings.app.enableBiometricId ? settings.app.enableBiometricId : false,
          lockPage: (settings.app.lockPage || settings.app.darkTheme === undefined)
        };
      }
    });
  }

  async verify() {
    if (!this.options) {
      console.log('Options not found!');
      return;
    }
    let options = this.options;
    console.log('options', options);
    if (options.enableBiometricId) {
/* TODO fingerprint
      return this.useTouchIdFaceId()
        .then(() => {
          return {
            data: {
              type: 'dismiss',
              data: true,
            }
          };
        }).catch((error: any) => {
          console.log(`ERROR: ${this.authType}`, error);
          return this.useKeypad(extendedOptions);
        })
        */
    } else {
      return this.useKeypad(options);
    }
  }

  async useKeypad(options: object) {
    const modal = await this.modalCtrl.create({
      component: LockPage,
      backdropDismiss: false,
      cssClass: 'modal-fullscreen',
      componentProps: {
        ...options
      }
    });

    modal.present();

    return modal.onDidDismiss();
  }
/*
  async useTouchIdFaceId() {
    return this.fingerprint.isAvailable()
      .then(type => {
        // See more: https://github.com/NiklasMerz/cordova-plugin-fingerprint-aio#check-if-fingerprint-authentication-is-available
        this.authType = type === TYPE_FINGER ? 'Touch ID' : 'Face ID';

        return this.fingerprint.show({
          title: 'Title for Android only',
          subtitle: 'Sub title for Android only',
          description: `Authenticate with ${this.authType}`, // Only for iOS
          fallbackButtonTitle: 'Enter Passcode', // Only for iOS
          disableBackup: true, // IMPORTANT: We're implementing our own fallback using the keypad UI
        });
      })
  }
  */
}
