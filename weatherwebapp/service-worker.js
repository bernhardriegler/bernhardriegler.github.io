var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-celebrate-1';
var filesToCache = [
  '/weatherwebapp',
  '/weatherwebapp/index.html',
  '/weatherwebapp/scripts/app.js',
  '/weatherwebapp/images/clear.png',
  '/weatherwebapp/images/cloudy-scattered-showers.png',
  '/weatherwebapp/images/cloudy.png',
  '/weatherwebapp/images/fog.png',
  '/weatherwebapp/images/ic_add_white_24px.svg',
  '/weatherwebapp/images/ic_refresh_white_24px.svg',
  '/weatherwebapp/images/partly-cloudy.png',
  '/weatherwebapp/images/rain.png',
  '/weatherwebapp/images/scattered-showers.png',
  '/weatherwebapp/images/sleet.png',
  '/weatherwebapp/images/snow.png',
  '/weatherwebapp/images/thunderstorm.png',
  '/weatherwebapp/images/wind.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching App Shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        console.log('[ServiceWorker] Removing old cache', key);
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  var dataUrl = 'https://publicdata-weather.firebaseio.com/';
  if (e.request.url.indexOf(dataUrl) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched&Cached Data');
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
