import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWAがすでにインストールされているかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS Safariの場合の処理
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      setIsInstallable(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // デフォルトのインストールプロンプトを防ぐ
      e.preventDefault();
      // プロンプトイベントを保存
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      // iOSの場合の説明を表示
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert(
          'インストール方法:\n' +
          '1. Safari下部の共有ボタンをタップ\n' +
          '2. 「ホーム画面に追加」を選択\n' +
          '3. 「追加」をタップ'
        );
      }
      return;
    }

    // インストールプロンプトを表示
    await deferredPrompt.prompt();
    
    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWAがインストールされました');
    } else {
      console.log('PWAのインストールがキャンセルされました');
    }
    
    // プロンプトは一度しか使えないのでリセット
    setDeferredPrompt(null);
  };

  return {
    isInstallable,
    isInstalled,
    installPWA,
  };
};