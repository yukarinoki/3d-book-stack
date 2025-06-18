import { useEffect, useState } from 'react';

interface DeviceOrientationState {
  alpha: number | null; // Z軸周りの回転（0〜360度）
  beta: number | null;  // X軸周りの回転（-180〜180度）
  gamma: number | null; // Y軸周りの回転（-90〜90度）
  absolute: boolean;
  isSupported: boolean;
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientationState>({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false,
    isSupported: false,
  });

  useEffect(() => {
    // Device Orientation APIがサポートされているかチェック
    const isSupported = 'DeviceOrientationEvent' in window;
    
    if (!isSupported) {
      setOrientation(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setOrientation(prev => ({ ...prev, isSupported: true }));

    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
        isSupported: true,
      });
    };

    // iOS 13以降では許可が必要
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function') {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return orientation;
};