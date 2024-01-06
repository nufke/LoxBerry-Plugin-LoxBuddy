import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    public translate: TranslateService) {
    this.initializeApp();
  }

  initializeApp() {
    // Register available languages
    this.translate.addLangs(['en', 'nl', 'de']);

    // Set default language
    this.translate.use('en');
    this.translate.currentLang = 'en';
  }

}
