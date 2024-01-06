import { Component, Input, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.page.html',
  styleUrls: ['./lock.page.scss'],
  host: {
    '(document:keydown)': 'handleKeyboardEvent($event)'
  }
})
export class LockPage {
  @Input() pin: string;
  @Input() enableBiometricId: boolean;
  @Input() lockPage: boolean;

  @HostListener('touchstart', ['$event'])
  @HostListener('touchmove', ['$event'])
  refreshUserState() {
    if (!this.lockPage) {
      this.dismiss();
    } else {
      this.infoPage = false;
    }
  }

  themeColor: string = 'medium';
  inputCombination: string = '';
  dots: any[] = [];
  isIncorrect: Boolean = false;

  infoPage = true; // always show first the info page
  time;
  date;

  constructor(public translate: TranslateService,
              private modalCtrl: ModalController) {

    // update date every sec
    setInterval(() => { 
      this.time = moment().locale(this.translate.currentLang).format('LT');
      this.date = moment().locale(this.translate.currentLang).format('dddd D MMMM');
    }, 1000);
  }

  ionViewWillEnter() {
    for (let i = 0; i < this.pin.length; i++) {
      this.dots.push({
        active: false
      })
    }
  }

  add(number: number) {
    if (this.inputCombination.length < this.pin.length) {
      this.inputCombination += '' + number;
      this.updateDots();

      if (this.inputCombination.length === this.pin.length) {
        this.verify();
      }
    }
  }

  delete() {
    if (this.inputCombination.length > 0) {
      this.inputCombination = this.inputCombination.slice(0, -1);
      this.updateDots();
    }
  }

  clear() {
    this.inputCombination = '';
    this.updateDots();
  }

  verify() {
    if (this.inputCombination === this.pin) {
      console.info('CORRECT PIN!');
      this.dismiss();
    } else {
      this.isIncorrect = true;
      //this.taptic.notification({type: 'error'});
      setTimeout(() => {
        this.clear();
        this.isIncorrect = false;
      }, 1000);
    }
  }

  updateDots() {
    for (let i = 0; i < this.dots.length; i++) {
      this.dots[i].active = i < this.inputCombination.length ? true : false;
    }
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key.match(/[0-9]/i)) {
      this.add(parseInt(event.key));
    } else if (event.key === 'Backspace') {
      this.delete();
    }
  }

  cancel() {
    this.modalCtrl.dismiss({
      type: 'cancel'
    });
  }

  dismiss() {
    this.modalCtrl.dismiss({
      type: 'dismiss',
      data: true
    })
  }

}
