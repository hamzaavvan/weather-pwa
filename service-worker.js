var cacheName = 'weatherPWA-step-6-1';
var dataCacheName = 'weatherData-v1';
var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(keyList => {
      return new Promise.all(keyList.map(key => {
        if (key !== cacheName && key !== dataCacheName) {
          console.log("[ServiceWorker] Removing old cache", key);
          return caches.delete(key);
        }
      }))
    })
  );

  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';

  console.log("[SW] Fetch", e.request.url);
  console.log(e.request);

  if (e.request.url.indexOf(dataUrl) > -1) {
    e.respondWith(
      caches.open(dataCacheName).then(cache => {
        return fetch(e.request).then(res => {
          cache.put(e.request.url, res.clone());
          return res;
        })
      })
    )
  } else {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    )
  }
});