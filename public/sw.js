const CACHE_NAME = 'incoterm-calc-v9';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon192.png',
  '/icon512.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果快取中有回應，則返回快取的回應
        if (response) {
          return response;
        }
        
        // 否則嘗試從網路獲取
        return fetch(event.request).then(
          (response) => {
            // 檢查是否為有效的回應
            if(!response || response.status !== 200) {
              return response;
            }

            // 複製回應
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // 如果網路和快取都失敗，返回離線頁面
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// 更新 Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
