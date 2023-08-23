import { Component, ViewChild } from '@angular/core';
import { NavController, IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  @ViewChild('tabs') tabs: IonTabs;

  constructor(
    private navCtrl: NavController)
  {}

  click(tab: string) {
    // TODO check other mechanism to navigate to tab root page
    this.navCtrl.navigateRoot(tab);
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
