const CACHE_NAME = 'studori-v54';
const PRECACHE_URLS = [
  './',
  'index.html',
  'css/style.css?v=54',
  'js/storage.js?v=54',
  'js/csv.js?v=54',
  'js/scheduler.js?v=54',
  'js/quiz.js?v=54',
  'js/game.js?v=54',
  'js/crossword.js?v=54',
  'js/cloud.js?v=54',
  'js/ui.js?v=54',
  'data/cuestionario.csv?v=54',
  'data/cuestionario%20Burpleria.csv?v=54',
  'data/cuestionario%20Primer%20Parcial%202026.csv?v=54'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Ignore Firebase, Google Auth, or non-GET requests
  if (event.request.method !== 'GET' || url.includes('googleapis.com') || url.includes('firebaseapp.com')) {
    return;
  }

  // Stale-While-Revalidate for app assets and CSVs
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
