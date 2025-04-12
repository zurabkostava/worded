import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging.js";

const CACHE_NAME = 'english-cards-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/quiz.js',
    '/tts.js',
    '/utils.js',
    '/wordhear.js',
    '/makeword.js',
    '/mix.js',
    '/typegame.js',
    '/sentence.js',
    '/puzzle.js',
    '/icons/icon-192.png'
];


const messaging = getMessaging(app);

navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
        console.log('✔ Firebase Messaging SW რეგისტრირებულია');

        const messaging = getMessaging(app);

        getToken(messaging, {
            vapidKey: "BNq3-Trxsd5PnOmcQY1AmUeuU-cKdYy75uHWSycU-jH1dvuq854pWRWEG_Um7xIDnQ7VtaO0FXoP8Gb8CbEyves",
            serviceWorkerRegistration: registration
        }).then((currentToken) => {
            if (currentToken) {
                console.log('🔐 ტოკენი:', currentToken);
                localStorage.setItem("fcmToken", currentToken);
            } else {
                console.warn("❌ ტოკენი ვერ მოიპოვა. ნებართვა მოთხოვნილია?");
            }
        }).catch((err) => {
            console.error("💥 Token მიღების შეცდომა:", err);
        });
    });

// ინსტალაცია
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

// ფეტჩი
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(resp => resp || fetch(event.request))
    );
});
self.addEventListener('push', function(event) {
    const data = event.data.json();

    const options = {
        body: data.body,
        // icon: '/icon.png', // სურვილისამებრ
        // badge: '/badge.png', // სურვილისამებრ
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
Notification.requestPermission().then(permission => {
    console.log("🔐 Notification permission:", permission);
});

importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

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

// Background push handler
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icons/icon-192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
