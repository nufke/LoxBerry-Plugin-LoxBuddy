import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
//import { NativeBiometric, BiometryType } from "@capgo/capacitor-native-biometric";
import { LockPage } from '../pages/lock/lock.page';
import { StorageService } from './storage.service'

const TYPE_FINGER = 'finger';

@Injectable({
  providedIn: 'root'
})
export class LockscreenService {
  authType: string = '';
  options;

  constructor(private modalCtrl: ModalController,
              private storageService: StorageService) {

    this.storageService.settings$.subscribe(settings => {
      if (settings && settings.app) {
        this.options = {
          pin: settings.app.pin,
          //enableBiometricId: settings.app.enableBiometricId ? settings.app.enableBiometricId : false,
          lockPage: settings.app.lockPage
        };
      }
    });
  }

  async verify() {
    if (!this.options) {
      return;
    }
    let options = this.options;
    if (options.enableBiometricId) {
      //return this.performBiometricVerification(options);
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
  async performBiometricVerification(options) {
    const result = await NativeBiometric.isAvailable();
  
    if(!result.isAvailable) {
      return this.useKeypad(options);
    };
  
    const isFaceID = result.biometryType == BiometryType.FACE_ID;
  
    const verified = await NativeBiometric.verifyIdentity({
      reason: "For easy log in",
      title: "Log in",
      subtitle: "Maybe add subtitle here?",
      description: "Maybe a description too?",
    })
      .then(() => true)
      .catch(() => false);
  
    if(!verified) {
      return this.useKeypad(options);
    }
  
    return {
      data: {
        type: 'dismiss',
        data: true,
      }
    };
  }
*/
}
