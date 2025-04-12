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
