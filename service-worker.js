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
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

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
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging.js";

const firebaseConfig = {
    apiKey: "AIzaSyArftPeH-SoIwmm2aKLDHBTE8M4DQ5jLM8",
    authDomain: "worded-1a455.firebaseapp.com",
    projectId: "worded-1a455",
    storageBucket: "worded-1a455.appspot.com",
    messagingSenderId: "385741553786",
    appId: "1:385741553786:web:c9e1d0d5bb662950f9fbc3",
    measurementId: "G-9QPQ3JE2MZ"
};

const vapidKey = "BNq3-Trxsd5PnOmcQY1AmUeuU-cKdYy75uHWSycU-jH1dvuq854pWRWEG_Um7xIDnQ7VtaO0FXoP8Gb8CbEyves";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ✅ მოითხოვე ნებართვა
Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
        console.log('🔓 ნებართვა მიცემულია');

        getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: navigator.serviceWorker.ready
        })
            .then((currentToken) => {
                if (currentToken) {
                    console.log("🔐 ტოკენი:", currentToken);
                    localStorage.setItem("fcmToken", currentToken);
                } else {
                    console.warn('⚠️ ტოკენი ვერ მოიძებნა');
                }
            })
            .catch((err) => {
                console.error('🔥 ტოკენის მიღების შეცდომა:', err);
            });

    } else {
        console.warn('⛔️ მომხმარებელმა არ მისცა ნებართვა');
    }
});
