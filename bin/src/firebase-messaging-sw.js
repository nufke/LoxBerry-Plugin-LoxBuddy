import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js';
import { getMessaging, onBackgroundMessage, isSupported } from 'https://www.gstatic.com/firebasejs/10.6.0/firebase-messaging-sw.js';

// get Firebase configuration settings via postMessage
addEventListener("message", event => {
  initFireBaseMessaging(event.data.url, event.data.headers);
});

function initFireBaseMessaging(url, headers) {
  isSupported().then(isSupported => {
    if (isSupported) {
      fetch(url, { headers })
        .then((response) => response.json())
        .then((json) => {
          const firebaseConfig = json.config.firebase;
          const app = initializeApp(firebaseConfig);
          const messaging = getMessaging(app);
          onBackgroundMessage(messaging, ({ notification: { title, body, image } }) => {
            self.registration.showNotification(title, { body, icon: image || '/assets/icons/icon-72x72.png' });
          });
        });
    }
  });
}
