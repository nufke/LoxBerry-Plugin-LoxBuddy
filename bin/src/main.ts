import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

/* TODO Workaround to remain ripple-effect when using local GestureController
   see
   https://github.com/ionic-team/ionic-framework/issues/22491
*/
window.addEventListener(
  "ionGestureCaptured",
  event => {
    event.stopPropagation();
  },
  true
);
