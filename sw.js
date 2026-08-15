const SHELL_CACHE = "guides-shell-v1";
const PACKAGE_PREFIX = "guides-package-";
const MARKER = "__guides_package_complete__";
const CATALOG_URL = new URL("./offline-catalog.json", self.registration.scope).href;
const legacyPrefixes = {
  pescara: ["pescara-weekend-"],
  namibia: ["namibia-", "namibia-plan-", "namibia-animals-", "namibia-packing-"],
  nyc: ["nyc-2026-"]
};
const allLegacyPrefixes = [...new Set([...Object.values(legacyPrefixes).flat(), "kiedy-i-dokad-"])];

const absolute = path => new URL(path, self.registration.scope).href;

async function loadCatalog(forceNetwork = false) {
  if (forceNetwork) {
    try {
      const response = await fetch(new Request(CATALOG_URL, { cache: "reload" }));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(CATALOG_URL, response.clone());
      return response.json();
    } catch (_) {}
  }
  const cached = await caches.match(CATALOG_URL);
  if (cached) return cached.json();
  const response = await fetch(CATALOG_URL);
  return response.json();
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const catalog = await loadCatalog(true);
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(catalog.shell.map(absolute));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key =>
      (key.startsWith("guides-shell-") && key !== SHELL_CACHE) ||
      allLegacyPrefixes.some(prefix => key.startsWith(prefix))
    ).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function packageStatus(catalog) {
  const keys = await caches.keys();
  const result = {};
  for (const pkg of catalog.packages) {
    const expected = `${PACKAGE_PREFIX}${pkg.id}-${pkg.version}`;
    const cache = keys.includes(expected) ? await caches.open(expected) : null;
    const complete = cache ? Boolean(await cache.match(absolute(MARKER))) : false;
    result[pkg.id] = {
      installed: complete,
      stale: !complete && keys.some(key => key.startsWith(`${PACKAGE_PREFIX}${pkg.id}-`))
    };
  }
  return result;
}

async function downloadPackage(pkg, port) {
  const cacheName = `${PACKAGE_PREFIX}${pkg.id}-${pkg.version}`;
  const cache = await caches.open(cacheName);
  let done = 0;
  const total = pkg.assets.length;
  try {
    for (let start = 0; start < total; start += 4) {
      const batch = pkg.assets.slice(start, start + 4);
      await Promise.all(batch.map(async path => {
        const url = absolute(path);
        const cached = await cache.match(url);
        if (cached) {
          done += 1;
          port.postMessage({ type: "PROGRESS", done, total });
          return;
        }
        const response = await fetch(new Request(url, { cache: "reload" }));
        if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
        await cache.put(url, response);
        done += 1;
        port.postMessage({ type: "PROGRESS", done, total });
      }));
    }
    await cache.put(absolute(MARKER), new Response(pkg.version));
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(`${PACKAGE_PREFIX}${pkg.id}-`) && key !== cacheName).map(key => caches.delete(key)));
  } catch (error) {
    throw error;
  }
}

async function deletePackage(id) {
  const prefixes = [`${PACKAGE_PREFIX}${id}-`, ...(legacyPrefixes[id] || [])];
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => prefixes.some(prefix => key.startsWith(prefix))).map(key => caches.delete(key)));
}

self.addEventListener("message", event => {
  const { type, packageId } = event.data || {};
  const port = event.ports?.[0];
  if (!port || !["GET_STATUS", "DOWNLOAD_PACKAGE", "DELETE_PACKAGE"].includes(type)) return;
  event.waitUntil((async () => {
    try {
      const catalog = await loadCatalog(type === "DOWNLOAD_PACKAGE");
      if (type === "GET_STATUS") {
        port.postMessage({ ok: true, packages: await packageStatus(catalog) });
        return;
      }
      const pkg = catalog.packages.find(item => item.id === packageId);
      if (!pkg) throw new Error("Nieznany pakiet przewodnika.");
      if (type === "DOWNLOAD_PACKAGE") await downloadPackage(pkg, port);
      else await deletePackage(pkg.id);
      port.postMessage({ ok: true });
    } catch (error) {
      port.postMessage({ ok: false, error: error.message || "Błąd trybu offline." });
    }
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if ([CATALOG_URL, absolute("index.html"), absolute("app.js"), absolute("styles.css"), absolute("manifest.webmanifest")].includes(url.href)) {
    event.respondWith(fetch(event.request).then(async response => {
      if (response.ok) await (await caches.open(SHELL_CACHE)).put(event.request, response.clone());
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        return response;
      } catch (_) {
        const direct = await caches.match(event.request);
        if (direct) return direct;
        const index = await caches.match(new URL("index.html", event.request.url).href);
        return index || caches.match(absolute("index.html"));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    return fetch(event.request);
  })());
});
