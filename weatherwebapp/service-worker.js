var dataCacheName = 'weatherData-v2';
var cacheName = 'weatherPWA-step-celebrate-2';
var filesToCache = [
  'https://bernhardriegler.github.io/weatherwebapp/',
  'https://bernhardriegler.github.io/weatherwebapp/index.html',
  'https://bernhardriegler.github.io/weatherwebapp/scripts/app.js',
  'https://bernhardriegler.github.io/weatherwebapp/images/clear.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/cloudy-scattered-showers.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/cloudy.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/fog.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/ic_add_white_24px.svg',
  'https://bernhardriegler.github.io/weatherwebapp/images/ic_refresh_white_24px.svg',
  'https://bernhardriegler.github.io/weatherwebapp/images/partly-cloudy.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/rain.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/scattered-showers.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/sleet.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/snow.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/thunderstorm.png',
  'https://bernhardriegler.github.io/weatherwebapp/images/wind.png'
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
