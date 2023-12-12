import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-sw.js';

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data.FCM_MSG.notification.click_action;
  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
        type: "window",
        //includeUncontrolled: true
    })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      }),
    );
});

// get Firebase configuration settings via postMessage of notification.service
let g_init = false;
self.addEventListener("message", event => {
  if (!g_init) {
     initFirebaseMessaging(event.data.url, event.data.headers);
     g_init = true;
  }
});

function initFirebaseMessaging(url, headers) {
  //console.log('initFirebaseMessaging...');
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
