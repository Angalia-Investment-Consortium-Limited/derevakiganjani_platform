importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDHJWGcSz97xPRzjIgbXbR0U063kqnrmcQ",
  authDomain: "derevakiganjani.firebaseapp.com",
  projectId: "derevakiganjani",
  storageBucket: "derevakiganjani.firebasestorage.app",
  messagingSenderId: "916725946911",
  appId: "1:916725946911:web:488c862e758912236d932a"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Dereva Kiganjani';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
