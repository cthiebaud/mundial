// Minimal SW — keeps PWA installable, no caching (network-only).
// Activate cleans up any stale caches from previous versions.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
));
self.addEventListener('fetch', () => {});
