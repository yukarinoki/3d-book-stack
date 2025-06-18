// Service Worker の登録と管理

interface Config {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    // Service Worker がサポートされている場合のみ登録
    const publicUrl = new URL(import.meta.env.BASE_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // PUBLIC_URLが異なるオリジンの場合は登録しない
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}service-worker.js`;

      if (isLocalhost) {
        // ローカルホストでの開発時の処理
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'このWebアプリはService Workerによってキャッシュファーストで提供されています。'
          );
        });
      } else {
        // 本番環境での登録
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // 新しいコンテンツが利用可能
              console.log(
                '新しいコンテンツが利用可能です。すべてのタブを閉じた後、再読み込みしてください。'
              );

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // コンテンツがオフライン使用のためにキャッシュされました
              console.log('コンテンツがオフライン使用のためにキャッシュされました。');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Service Workerの登録中にエラーが発生しました:', error);
      if (config && config.onError) {
        config.onError(error);
      }
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Service Workerが見つかるかチェック。見つからない場合はリロード
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' }
  })
    .then((response) => {
      // Service Workerが存在することを確認
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service Workerが見つからない。おそらくアプリが異なる。ページをリロード
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service Workerが見つかった。通常通り処理
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('インターネット接続が見つかりません。アプリはオフラインモードで実行されています。');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}