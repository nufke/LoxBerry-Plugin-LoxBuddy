import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IonRouterOutlet } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { NotificationMessage } from '../../interfaces/data.model';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit, OnDestroy {

  canGoBack: boolean;
  private currentUrl: string;
  previousUrl: string;

  notificationList: NotificationMessage[] = [];

  private routerEventsSubscription: Subscription;

  constructor(
    private ionRouterOutlet: IonRouterOutlet,
    private router: Router,
    private notificationService: NotificationService) {
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

    this.notificationService.notifications$.subscribe( (item) => {
      console.log('notifications received:', item);
      this.notificationList = item;
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
  }
  
  getMessages() {
    return this.notificationList ? this.notificationList : [];
  }

}
