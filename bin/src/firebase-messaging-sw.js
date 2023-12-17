import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-sw.js';
import "https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js";

// use INDEXEDDB for local storage
localforage.setDriver(localforage.INDEXEDDB);
console.log('(re)start firebase-messaging-sw.js...');

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data.click_action;
  // Check if the current client is already open and focuses if it is
  event.waitUntil(clients.matchAll({ type: "window" }).then((clientList) => {
    for (const client of clientList) {
      if (client.url === url && "focus" in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow("/");
  }));
});

// initialize FirebaseMessaging if key is known
localforage.getItem('firebaseConfig').then( firebaseConfig => {
  if (firebaseConfig.apiKey.length) {
    FirebaseMessaging.initialize(firebaseConfig);
  }
});

// get Firebase configuration settings via postMessage of notification.service
self.addEventListener("message", event => {
  if (event.data.type === 'FIREBASE_CONFIG') {
    const firebaseConfig = event.data.config;
    FirebaseMessaging.initialize(firebaseConfig);
    localforage.setItem('firebaseConfig', firebaseConfig)
    .catch( error => {
      console.log('error:', error);
    });
  }
});

class FirebaseMessaging { 
  static messaging;

  static initialize(firebaseConfig) {
    if (this.messaging) return;
    isSupported().then(isSupported => {
      if (isSupported) {
        const app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(app);
        this.registerMessage();
      }
    });
  }

  static registerMessage() {
    if (!this.messaging) return;
    onBackgroundMessage(this.messaging, payload => {
      return self.registration.showNotification(payload.data.title, {
        body: payload.data.message,
        icon: payload.data.icon,
        badge: payload.data.badge,
        click_action: payload.data.click_action,
        data: payload.data
      });
    });
  }
}
