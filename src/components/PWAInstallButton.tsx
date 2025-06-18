import { usePWAInstall } from '@/hooks';

export const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  // インストール済みまたはインストール不可の場合は表示しない
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installPWA}
      className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-lg flex items-center gap-2 transition-colors duration-200"
      aria-label="アプリをインストール"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <span>アプリをインストール</span>
    </button>
  );
};