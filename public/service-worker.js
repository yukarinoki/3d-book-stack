// Service Worker のバージョン管理
const CACHE_NAME = 'book-stack-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// キャッシュするファイルのリスト
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// インストールイベント
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // 新しいService Workerをすぐにアクティブにする
        return self.skipWaiting();
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // すべてのクライアントを制御下に置く
      return self.clients.claim();
    })
  );
});

// フェッチイベント - キャッシュ戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }

  // APIリクエストの処理（ネットワークファースト）
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したレスポンスをキャッシュに保存
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // ネットワークエラー時はキャッシュから返す
          return caches.match(request);
        })
    );
    return;
  }

  // 静的リソースの処理（キャッシュファースト）
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          // キャッシュが見つかった場合
          return response;
        }

        // キャッシュになければネットワークから取得
        return fetch(request).then((response) => {
          // 有効なレスポンスかチェック
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをキャッシュに保存
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // オフライン時のフォールバック
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-books') {
    event.waitUntil(
      // IndexedDBとサーバーの同期処理
      syncBooksWithServer()
    );
  }
});

// プッシュ通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '新しい本が追加されました',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('3D Book Stack', options)
  );
});

// 同期処理の実装（スタブ）
async function syncBooksWithServer() {
  // 将来的にサーバーとの同期処理を実装
  console.log('Syncing books with server...');
}