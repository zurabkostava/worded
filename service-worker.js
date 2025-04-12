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
