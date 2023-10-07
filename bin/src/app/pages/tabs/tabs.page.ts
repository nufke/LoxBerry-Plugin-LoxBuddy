import { Component, ViewChild, HostListener } from '@angular/core';
import { NavController, IonTabs } from '@ionic/angular';
import { Subject } from 'rxjs';
import { LockscreenService } from '../../services/lockscreen.service';
import { StorageService } from '../../services/storage.service'

const TIMEOUT_DEFAULT = 3000; // 60 sec

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  @ViewChild('tabs') tabs: IonTabs;

  userActivity;
  userInactive: Subject<any> = new Subject();
  isLocked = false;
  isCorrect: Boolean = false;
  timeout: number = TIMEOUT_DEFAULT;

  @HostListener('window:mousemove') refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }

  constructor(
    private navCtrl: NavController,
    private lockscreenService: LockscreenService,
    private storageService: StorageService)
  {
    this.setTimeout();

    this.storageService.settings$.subscribe(settings => {
      if (settings && settings.app) {
        this.timeout = settings.app.timeout ? settings.app.timeout : TIMEOUT_DEFAULT; 
        clearTimeout(this.userActivity);
        this.setTimeout();
      }
    });

    this.userInactive.subscribe(() => {
      if (!this.isLocked) this.showLockscreen();
    });

  }

  click(tab: string) {
    // TODO check other mechanism to navigate to tab root page
    this.navCtrl.navigateRoot(tab);
  }

  setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), this.timeout);
  }

  showLockscreen() {
    this.isLocked = true;
    this.lockscreenService.verify()
      .then((response: any) => {
        const { data } = response;

        console.info('Response from lockscreen service: ', data);

        if (data.type === 'dismiss') {
          this.isCorrect = data.data;
          this.isLocked = false;
        } else {
          this.isCorrect = false;
        }
      })
  }

/*
  onSwipe(event) {
    if (event?.swipeType === 'moveend') {
      const currentTab = this.tabs.getSelected();
      const nextTab = this.getNextTab(currentTab, event?.dirX);
      if (nextTab) this.navCtrl.navigateRoot(nextTab);
    }
  }

  getNextTab(currentTab, direction) {
    switch (currentTab) {
      case 'home':
        if (direction === 'left') return 'room'; else return null;
        break;
      case 'room':
        if (direction === 'right') return 'home'; else return 'category';
        break;
      case 'category':
        if (direction === 'right') return 'room'; else return null;
        break;
      default:
    }
  }
  */
}
