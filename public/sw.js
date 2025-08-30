const CACHE_NAME = 'incoterm-calc-v7';

// 需要預緩存的關鍵資源
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.d7bdd763.js',
  '/static/css/main.7799f1f5.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        // 預緩存關鍵資源
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All critical resources cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.log('Cache addAll failed:', error);
        // 即使預緩存失敗，也要繼續安裝
        return self.skipWaiting();
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// 攔截請求 - 使用更強制的緩存策略
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  
  // 對於導航請求，優先使用緩存
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then((response) => {
          if (response) {
            console.log('Serving index.html from cache');
            return response;
          }
          return fetch(event.request);
        })
        .catch(() => {
          console.log('Navigation failed, serving offline page');
          return new Response(`
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>離線 - 報價計算器</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; text-align: center; }
                .container { max-width: 400px; margin: 0 auto; }
                .icon { font-size: 48px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">📱</div>
                <h2>離線模式</h2>
                <p>您目前處於離線狀態。請檢查網絡連接後重試。</p>
                <p>如果已安裝應用，請從主螢幕打開。</p>
              </div>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }
  
  // 對於其他請求，使用 Cache First 策略
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果找到緩存，返回緩存
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        // 如果沒有緩存，嘗試從網絡獲取
        return fetch(event.request)
          .then((response) => {
            // 檢查響應是否有效
            if (!response || response.status !== 200) {
              return response;
            }
            
            // 只緩存 GET 請求
            if (event.request.method !== 'GET') {
              return response;
            }
            
            // 克隆響應以便緩存
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
                console.log('Cached:', event.request.url);
              });
            
            return response;
          })
          .catch((error) => {
            console.log('Network request failed:', event.request.url, error);
            
            // 對於其他請求，返回空響應
            return new Response('', {
              status: 408,
              statusText: 'Request timeout'
            });
          });
      })
  );
});

// 監聽來自客戶端的消息
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
