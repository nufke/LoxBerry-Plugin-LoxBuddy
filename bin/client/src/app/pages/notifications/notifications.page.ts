import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Observable, combineLatest } from 'rxjs';
import { map } from "rxjs/operators";
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../services/data.service';
import { NotificationMessage, SystemMessage } from '../../interfaces/data.model';
import { MessageListVM } from '../../interfaces/view.model';
import { MessagingService } from '../../services/messaging.service';
import * as moment from 'moment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit, OnDestroy {

  canGoBack: boolean;
  private currentUrl: string;
  previousUrl: string;

  vm$: Observable<MessageListVM>;
  segment: string = 'messages';
  
  private routerEventsSubscription: Subscription;

  constructor(
    private ionRouterOutlet: IonRouterOutlet,
    private router: Router,
    private dataService: DataService,
    public translate: TranslateService,
    // note: although not used directly, we need to init the messagingService to grab the notifications
    private messagingService: MessagingService) {
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
    combineLatest([
      this.dataService.notifications$,
      this.dataService.systemStatus$,
    ]).pipe( 
        map(([notifications, systemStatus]) => {
          return this.updateVM(notifications, systemStatus);
        })
      );
  }

  private updateVM(notifications: NotificationMessage[], systemStatus: SystemMessage[]) : MessageListVM {
    let dates = [];
    let items = {};

    notifications.forEach( notification => {
      let tsdate = this.getDate(notification.ts);
      if (dates.findIndex( date => date === tsdate) == -1) {
        dates.push(tsdate);
      };
    });

    for (let i = 0; i < dates.length; i++) {
      items[dates[i]] = notifications
        .filter( item => this.getDate(item.ts) === dates[i])
        .sort( (a, b) => Number(b.ts) - Number(a.ts));
    }

    let entries = [];
    if (systemStatus && systemStatus[0] && systemStatus[0].entries) {
      entries = systemStatus[0].entries;
    }
    let systemItems = {};
    let systemDates = [];

    entries.forEach( entry => {
      let tsdate = this.getDate(entry.timestamps[0].toString());
      if ((systemDates.findIndex( date => date === tsdate) == -1) && (entry.isHistoric == false)) {
        systemDates.push(tsdate);
      };
    });

    for (let i = 0; i < systemDates.length; i++) {
      systemItems[systemDates[i]] = entries
        .filter( item => this.getDate(item.timestamps[0].toString()) === systemDates[i])
        .sort( (a, b) => Number(b.timestamps[0].toString()) - Number(a.timestamps[0].toString()));
    }
    //console.log('systemItems', systemItems);
    const vm: MessageListVM = {
      items: items,
      system: systemItems
    };

    return vm;
  }

  getDate(ts: string) : string {
    return moment(Number(ts)*1000).locale(this.translate.currentLang).format('LL');
  }

  getTime(ts: string) : string {
    return moment(Number(ts)*1000).locale(this.translate.currentLang).format('LT');
  }

  getDates(items: any) : string[] {
    if (!items) return [];
    let dates = Object.keys(items);
    dates.sort( (a, b) => items[b][0].ts - items[a][0].ts );
    return dates;
  }

  getSystemDates(items: any) : string[] {
    if (!items) return [];
    let dates = Object.keys(items);
    dates.sort( (a, b) => items[b][0].timestamps[0].toString() - items[a][0].timestamps[0].toString() );
    return dates;
  }

  getSize(items: any) : number {
    if (!items) return 0;
    return Object.keys(items).length;
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
  }

  updateSegment() {
    // Close any open sliding items when the schedule updates
  }
}
