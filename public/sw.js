// Kill-switch service worker.
// The old single-file ContentOS registered a cache-first service worker at "/"
// which kept serving the OLD app from cache. This replaces it: it deletes every
// cache, unregisters itself, and reloads open tabs so the new Unified OS loads.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
// No fetch handler on purpose: every request goes straight to the network.
