const CACHE_PREFIX="namibia-packing-";
const CACHE_NAME="namibia-packing-v1";
const FILES=["./","./index.html","./styles.css","./data.js","./app.js","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>null)))));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request)).catch(()=>caches.match("./index.html")));});
