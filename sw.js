const CACHE_NAME = 'successor-health-v4';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './dist/app.js',
  './lib/petite-vue.js',
  './images/hero.png',
  './images/stew.png',
  './images/bowl.png',
  './images/parfait.png',
  './images/salmon.png',
  './images/bark.png',
  './images/superveggie.png',
  './images/nuttypudding.png',
  './images/egg-noodle-soup.png',
  './images/gochujang-booster.png',
  './images/loaded-potato.png',
  './images/tofu-stir-fry.png',
  './images/lentil-curry.png',
  './images/sardine-couscous.png',
  './images/blade-stew.png',
  './images/protein-bars.png',
  './images/super-veggie.png',
  './images/dijon-chicken.png',
  './images/chicken-paprikash.png',
  './images/bread-pudding.png',
  './manifest.json'
];

// Cache all core assets during installation
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Clear old caches when a new service worker activates
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-First strategy with network fallback
self.addEventListener('fetch', event => {
  // Allow caching of local origin OR the gstatic Firebase CDN (ignored otherwise)
  const isLocal = event.request.url.startsWith(self.location.origin);
  const isGstatic = event.request.url.startsWith('https://www.gstatic.com/');
  
  if (event.request.method !== 'GET' || (!isLocal && !isGstatic)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Return from cache, but fetch fresh in background to update cache (stale-while-revalidate)
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignore network failures when offline */});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
