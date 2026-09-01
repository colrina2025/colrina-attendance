// Colrina Attendance — Service Worker
// Caches face model files so they load instantly after first visit

const CACHE_NAME = 'colrina-face-cache-v1';
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

// Install — cache all face model files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache first, then network
self.addEventListener('fetch', event => {
  if (URLS_TO_CACHE.some(url => event.request.url.includes('face-api') || event.request.url.includes('cdn.jsdelivr.net'))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
