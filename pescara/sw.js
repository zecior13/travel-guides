const CACHE = 'pescara-weekend-v1.0.0';
const ASSETS = [
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './assets/icon-192.png','./assets/icon-512.png',
  './assets/ponte.jpg','./assets/trabocco.jpg','./assets/abbazia.jpg',
  './assets/arrosticini.jpg','./assets/pallotte.jpg','./assets/chitarra.png',
  './assets/parrozzo.jpg','./assets/brodetto.jpg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
