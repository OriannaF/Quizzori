const CACHE_NAME = 'studori-v65';
const PRECACHE_URLS = [
  './',
  'index.html',
  'manifest.json',
  'css/style.css',
  'css/style.css?v=65',
  'js/storage.js',
  'js/storage.js?v=65',
  'js/csv.js',
  'js/csv.js?v=65',
  'js/scheduler.js',
  'js/scheduler.js?v=65',
  'js/quiz.js',
  'js/quiz.js?v=65',
  'js/game.js',
  'js/game.js?v=65',
  'js/crossword.js',
  'js/crossword.js?v=65',
  'js/image_quiz.js',
  'js/image_quiz.js?v=65',
  'js/cloud.js',
  'js/cloud.js?v=65',
  'js/ui.js',
  'js/ui.js?v=65',
  'data/cuestionario.csv',
  'data/cuestionario.csv?v=65',
  'data/cuestionario%20Burpleria.csv',
  'data/cuestionario%20Burpleria.csv?v=65',
  'data/cuestionario%20Primer%20Parcial%202026.csv',
  'data/cuestionario%20Primer%20Parcial%202026.csv?v=65'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Precache skipped for:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
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
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;

  // Ignore Firebase Auth / Google Cloud APIs / Firestore
  if (
    url.includes('identitytoolkit') ||
    url.includes('securetoken') ||
    url.includes('tasks.googleapis.com') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('firebaseapp.com/__/auth')
  ) {
    return;
  }

  // Google Fonts & Material Symbols (Cache first with runtime caching)
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Navigation requests (HTML page load)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((cached) =>
            cached || caches.match('index.html') || caches.match('./')
          )
        )
    );
    return;
  }

  // App static assets & CSV data (match exact URL first including version, then fallback)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || caches.match(req, { ignoreSearch: true }));

      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_OFFLINE_ALL') {
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((u) => cache.add(u).catch(() => {}))
      );
    }).then(() => {
      if (event.source && event.source.postMessage) {
        event.source.postMessage({ type: 'CACHE_OFFLINE_DONE', ok: true });
      }
    });
  }
});
