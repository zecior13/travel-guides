const CACHE_PREFIX="kiedy-i-dokad-";
const CACHE_NAME="kiedy-i-dokad-v2";
const FILES=["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png","./icons/favicon-32.png","../../shared/common.css"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>null)))));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url); if(u.origin!==self.location.origin)return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,cp));}return r;})).catch(()=>caches.match("./index.html")));
});
