// EATED service worker: app disponible sin internet. Cambia VERSION al publicar cambios.
const VERSION = "eated-v1.8.0";
const SHELL = ["./", "index.html", "styles.css", "js/app.js", "js/foods.js", "manifest.webmanifest", "icons/icon-192.png", "icons/apple-touch-icon.png", "vendor/zxing-browser.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // APIs externas: siempre red
  // Red primero (para recibir actualizaciones), caché si no hay conexión
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
