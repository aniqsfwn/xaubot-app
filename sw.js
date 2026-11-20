// Offline shell for XauBot: app files from cache when offline, live data always from the network.
const CACHE = 'xaubot-v1';
const SHELL = ['./', 'index.html', 'shim.js', 'config.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/apple-touch-icon.png', 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.hostname === 'api.github.com' || url.hostname.endsWith('githubusercontent.com')) return;  // live data: never cached
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
