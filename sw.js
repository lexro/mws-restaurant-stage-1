const urlsToCache = [
  '/js/main.js',
  '/js/dbhelper.js',
  'js/restaurant_info.js',
  'css/styles.css',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'data/restaurants.json',
  'index.html',
  'restaurant.html'
];
const CACHE_NAME = 'rr-cache-v2';

// precache this stuff
this.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// delete other caches
this.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return cacheName.startsWith('rr-cache') && cacheName !== CACHE_NAME;
        })
        .map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// hijack requests and cache them
this.addEventListener('fetch', function (event) {
  const url = event.request.url;

  if (_shouldHijack(url)) {
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          }

          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then(
            function (response) {
              if (!_shouldCache(response, url)) {
                return response;
              }

              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then(function (cache) {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          );
        })
      );
    }
});

function _shouldHijack (url) {
  const isBlank = url === 'about:blank';

  if (isBlank) {
    return false;
  }

  return true;
}

function _shouldCache (response, url) {
  return response && response.status === 200 && response.type == 'basic';
}
