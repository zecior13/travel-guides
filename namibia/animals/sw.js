const CACHE_PREFIX = "namibia-animals-";
const CACHE_NAME = "namibia-animals-v2";

const PHOTO_FILES = Array.from({ length: 60 }, (_, i) =>
  `./photos/${String(i + 1).padStart(2, "0")}.jpg`
);

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  ...PHOTO_FILES
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        FILES_TO_CACHE.map(url =>
          cache.add(url).catch(err => console.warn("Cache fail:", url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
