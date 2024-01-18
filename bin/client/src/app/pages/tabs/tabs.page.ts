import { Component, ViewChild, HostListener, OnInit, OnDestroy } from '@angular/core';
import { NavController, IonTabs } from '@ionic/angular';
import { Subject, Subscription } from 'rxjs';
import { LockscreenService } from '../../services/lockscreen.service';
import { StorageService } from '../../services/storage.service'
import { SoundService } from '../../services/sound.service';
import { MessagingService } from '../../services/messaging.service';

const TIMEOUT_DEFAULT = 300000; // 5 min

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {
  @ViewChild('tabs') tabs: IonTabs;

  userActivity;
  userInactive: Subject<any> = new Subject();
  isLocked = false;
  isCorrect: Boolean = false;
  timeout: number = TIMEOUT_DEFAULT;

  // mouse or pointer move resets timeout
  @HostListener('window:mousemove') 
  refreshUserState() {
    clearTimeout(this.userActivity);
    this.setTimeout();
  }

  // if app moves to background or return from background, reset timeout
  @HostListener('document:visibilitychange', ['$event'])
  visibilityChange() {
    if (document.hidden) {
      clearTimeout(this.userActivity);
      this.messagingService.toBackground();
    } else {
      clearTimeout(this.userActivity);
      this.setTimeout();
      this.messagingService.toForeground();
    }
  }

  private storageSubscription: Subscription;
  private userInactiveSubscription: Subscription;

  constructor(
    private navCtrl: NavController,
    private lockscreenService: LockscreenService,
    private storageService: StorageService,
    private soundService: SoundService,
    private messagingService: MessagingService)
  {
    this.setTimeout();
    this.soundService.registerSound('notification', 'assets/sounds/notification.mp3');
  }

  ngOnInit(): void {
    this.storageSubscription = this.storageService.settings$.subscribe(settings => {
      if (settings && settings.app) {
        this.timeout = settings.app.timeout ? settings.app.timeout : TIMEOUT_DEFAULT;
        clearTimeout(this.userActivity);
        this.setTimeout();
      }
    });

    this.userInactiveSubscription = this.userInactive.subscribe(() => {
      if (!this.isLocked) this.showLockscreen();
    });
  }

  ngOnDestroy(): void {
    this.userInactiveSubscription.unsubscribe();
    this.storageSubscription.unsubscribe();
  }
  
  click(tab: string) {
    // TODO check other mechanism to navigate to tab root page
    this.navCtrl.navigateRoot(tab);
  }

  private setTimeout() {
    this.userActivity = setTimeout(() => this.userInactive.next(undefined), this.timeout);
  }

  private showLockscreen() {
    this.isLocked = true;
    this.lockscreenService.verify()
      .then((response: any) => {
        const { data } = response;
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
