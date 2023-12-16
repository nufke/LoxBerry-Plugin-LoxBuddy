import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-sw.js';

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  //console.log('notificationclick event:', event);
  const url = event.notification.data.click_action;
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
        // Custom handling of push messages as pure data object, to avoid that FCM SDK will handle it 
        onBackgroundMessage(messaging, payload => {
          return self.registration.showNotification(payload.data.title, {
            body: payload.data.message,
            icon: payload.data.icon,
            badge: payload.data.badge,
            click_action: payload.data.click_action,
            data: payload.data
          });
        });
      });
    }
  });
}
