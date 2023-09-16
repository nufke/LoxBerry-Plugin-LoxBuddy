import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IonRouterOutlet } from '@ionic/angular';
import packageJson from '../../../../package.json';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit, OnDestroy {
  private routerEvents: any;
  private currentUrl: string;

  previousUrl: string;
  canGoBack: boolean;
  version: string;

  constructor(
    private router: Router,
    private ionRouterOutlet: IonRouterOutlet) { }

  ngOnInit() {
    this.canGoBack = this.ionRouterOutlet.canGoBack();
    this.currentUrl = this.router.url;

    this.routerEvents = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
          this.previousUrl = this.currentUrl;
          this.currentUrl  = event.url;
      }
    });

    this.version = packageJson.version;
  }

  ngOnDestroy() {
    this.routerEvents.unsubscribe();
  }
}
