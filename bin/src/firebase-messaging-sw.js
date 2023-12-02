import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-sw.js';

(() => {

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  console.log("notificationclick", event);
  const url = event.notification.data.FCM_MSG.notification.click_action;
  event.waitUntil(clients.matchAll({
    type: "window",
    includeUncontrolled: true
  }).then(function (clientList) {
    if (url) {
      let client = null;
      for (let i = 0; i < clientList.length; i++) {
        let item = clientList[i];
        if (item.url) {
          client = item;
          break;
        }
      }
      if (client && 'navigate' in client) {
        client.focus();
        event.notification.close();
        return client.navigate(url);
      }
      else {
        event.notification.close();
        // if client doesn't have navigate function, try to open a new browser window
        return clients.openWindow(url);
      }
    }
  }));
}
);

// get Firebase configuration settings via postMessage of notification.service
let g_init = false;
self.addEventListener("message", event => {
  console.log('initFirebaseMessaging...');
  if (!g_init) {
     initFirebaseMessaging(event.data.url, event.data.headers);
     g_init = true;
  }
});

function initFirebaseMessaging(url, headers) {
  isSupported().then(isSupported => {
    if (isSupported) {
      fetch(url, { headers })
        .then((response) => response.json())
        .then((json) => {
          const firebaseConfig = json.config.firebase;
          const app = initializeApp(firebaseConfig);
          const messaging = getMessaging(app);
          console.log('getMessaging:', messaging);
          /* Background push message disabled since this is already managed in 
             the default ngsw-worker.js serviceworker */
          //onBackgroundMessage(messaging, ({ notification: { title, body, image } }) => {
          //  self.registration.showNotification(title, { body, icon: image || '/assets/icons/icon-72x72.png' });
          //});
        });
    }
  });
}

})();