/*
 * DV Birthday Notepad — Service Worker
 * Offline-first, cache-first strategy for every local file.
 * The Dictionary tab calls a live external API (api.dictionaryapi.dev) —
 * those requests are intentionally passed straight to the network,
 * never cached, since a dictionary lookup must always be current.
 *
 * IMPORTANT: bump CACHE_NAME (e.g. -v2, -v3) every time you deploy an
 * updated file. Without a version bump, returning visitors keep
 * getting the OLD cached files.
 *
 * If you add a NEW .js file (per your <script src="..."> map), add its
 * filename to CACHE_ASSETS below too, or it won't be available offline.
 */
const CACHE_NAME = 'birthday-notepad-v1.6';

const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './core.js',
  './about-app.js',
  './about-developer.js',
  './about-us.js',
  './how-to-use.js',
  './terms-of-use.js',
  './proprietary-software.js',
  './support-us.js',
  './contact.js',
  './accent-color-selector.js',
  './dark-mode-toggle.js',
  './font-selector.js',
  './font-slider.js',
  './to-do.js',
  './install-app.js',
  './share-app.js',
  './export.js',
  './note.js',
  './planner.js',
  './dictionary.js',
  './home.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never intercept the live Dictionary API — always go straight to network.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
