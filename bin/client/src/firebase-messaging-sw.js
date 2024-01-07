import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getMessaging, isSupported } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-sw.js';
import "https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js";

// use INDEXEDDB for local storage
localforage.setDriver(localforage.INDEXEDDB);
console.log('(re)start firebase-messaging-sw.js...');
var background = true;  // initial value when serviceworker is started

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data.click_action;
  // Check if the current client is already open and focuses if it is
  event.waitUntil(clients.matchAll({ type: "window" }).then((clientList) => {
    for (const client of clientList) {
      if (client.url === url && "focus" in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});

// initialize FirebaseMessaging if firebase config is already known
localforage.getItem('firebaseConfig').then( firebaseConfig => {
  if (firebaseConfig.apiKey.length) {
    FirebaseMessaging.initialize(firebaseConfig);
  }
});

// Instead of using onBackgroundMessage, we implement the push handling ourselves
// to avoid issues when a stopped and restarted serviceworker does not properly 
// address the showNotification call, causing an unwanted push message like:
// "This site has been updated in the background"
// The background state is managed by the App and passed to the serviceworker, 
// to reduce the time required for the serviceworker to extract the client state 
// when waking up from deep sleep (doze) mode, causing a significatnt delay in the
// notification handling for mobile users   
self.addEventListener('push', function (event) {
  if (background) {
    event.waitUntil(self.registration.showNotification(event.data.json().data.title, {
      body: event.data.json().data.message,
      icon: event.data.json().data.icon,
      badge: event.data.json().data.badge,
      click_action: event.data.json().data.click_action,
      data: event.data.json().data
    }));
  }
});

// get Firebase configuration settings via postMessage of notification.service
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    const firebaseConfig = event.data.config;
    //console.log('firebaseConfig:', firebaseConfig);
    FirebaseMessaging.initialize(firebaseConfig);
    // save firebaseConfig such that restarted serviceworker knows the config
    localforage.setItem('firebaseConfig', firebaseConfig)
    .catch( error => {
      console.log('error:', error);
    });
  }
  if (event.data && event.data.type === 'STATE') {
    background = event.data.background;
    //console.log('background set to:', background);
  }
});

class FirebaseMessaging {
  static messaging;

  static initialize(firebaseConfig) {
    if (this.messaging) return; // only initialize once
    isSupported().then(isSupported => {
      if (isSupported) {
        const app = initializeApp(firebaseConfig);
        this.messaging = getMessaging(app);
      }
    });
  }
} 
