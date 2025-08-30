import React, { useEffect, useState } from 'react';

const PWARegister: React.FC = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPromptInstall(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 檢查是否支持 PWA
    if ('serviceWorker' in navigator) {
      setSupportsPWA(true);
    }

    // 監聽網絡狀態
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // 立即註冊 Service Worker
    if ('serviceWorker' in navigator && !swRegistered) {
      console.log('Registering Service Worker...');
      
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          setSwRegistered(true);
          
          // 檢查是否有更新
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New version available');
                  if (window.confirm('有新版本可用，是否立即更新？')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log('Service Worker registration failed:', registrationError);
        });
    }
  }, [swRegistered]);

  const handleInstallClick = () => {
    if (promptInstall) {
      promptInstall.prompt();
      promptInstall.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setShowInstallPrompt(false);
      });
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
  };

  // 顯示安裝提示或 Service Worker 狀態
  if (!supportsPWA) {
    return null;
  }

  // 如果沒有安裝提示但有 Service Worker，顯示狀態
  if (!showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white rounded-2xl shadow-lg border p-4 max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">PWA 已準備就緒</h3>
              <p className="text-xs text-gray-600">
                {swRegistered 
                  ? "Service Worker 已註冊，可以離線使用" 
                  : "正在註冊 Service Worker..."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg border p-4 max-w-sm mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">安裝應用</h3>
            <p className="text-xs text-gray-600">
              {isOnline 
                ? "將報價計算器添加到主螢幕，離線也能使用" 
                : "離線模式：已安裝的應用可以離線使用"
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            安裝
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            稍後
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWARegister;
