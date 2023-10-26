import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../services/notification.service';
import { NotificationMessage } from '../../interfaces/data.model';
import * as moment from 'moment';

interface NotificationMessageVM {
  items: { [key: string]: NotificationMessage[] };
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit, OnDestroy {

  canGoBack: boolean;
  private currentUrl: string;
  previousUrl: string;

  vm$: Observable<NotificationMessageVM>;

  private routerEventsSubscription: Subscription;

  constructor(
    private ionRouterOutlet: IonRouterOutlet,
    private router: Router,
    private notificationService: NotificationService,
    public translate: TranslateService) {
  }

  ngOnInit(): void {
    this.canGoBack = this.ionRouterOutlet.canGoBack();
    this.currentUrl = this.router.url;

    this.routerEventsSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          this.previousUrl = this.currentUrl;
          this.currentUrl  = event.url;
      }
    });

    this.vm$ = 
      this.notificationService.notifications$.pipe(
        map((notifications) => {
          return this.updateVM(notifications);
        })
      );
  }

  private updateVM(notifications: NotificationMessage[]) : NotificationMessageVM {
    let dates = [];
    let items = {};

    notifications.forEach( notification => {
      let tsdate = this.getDate(notification.ts);
      if (dates.findIndex( date => date === tsdate) == -1) {
        dates.push(tsdate);
      };
    });

    for (let i = dates.length-1; i > -1; i--) {
      items[dates[i]] = notifications
        .filter( item => this.getDate(item.ts) === dates[i])
        .sort( (a, b) => b.ts - a.ts);
    }

    const vm: NotificationMessageVM = {
      items: items,
    };
    return vm;
  }

  getDate(ts: number) : string {
    return moment(ts*1000).locale(this.translate.currentLang).format('LL');
  }

  getTime(ts: number) : string {
    return moment(ts*1000).locale(this.translate.currentLang).format('LT');
  }

  getDates(items: any) : string[] {
    if (!items) return [];
    return Object.keys(items);
  }

  getSize(items: any) : number {
    if (!items) return 0;
    return Object.keys(items).length;
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
  }

}
