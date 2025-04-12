importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyArftPeH-SoIwmm2aKLDHBTE8M4DQ5jLM8",
    authDomain: "worded-1a455.firebaseapp.com",
    projectId: "worded-1a455",
    storageBucket: "worded-1a455.appspot.com",
    messagingSenderId: "385741553786",
    appId: "1:385741553786:web:c9e1d0d5bb662950f9fbc3",
    measurementId: "G-9QPQ3JE2MZ"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] Background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        // icon: '/icon.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
