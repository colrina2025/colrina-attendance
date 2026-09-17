// Colrina Attendance — Service Worker v2
// Caches face model files for instant loading after first visit

const CACHE_NAME = 'colrina-face-v2';

const URLS_TO_CACHE = [
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-shard1',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_model-shard1',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-shard1',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-shard2'
];

// Install — cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        URLS_TO_CACHE.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, then network
self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('face-api') || url.includes('jsdelivr.net') || url.includes('unpkg.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
  }
});
