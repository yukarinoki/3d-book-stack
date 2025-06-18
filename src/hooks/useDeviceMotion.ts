import { useEffect, useState, useRef } from 'react';

interface DeviceMotionState {
  acceleration: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  accelerationIncludingGravity: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  rotationRate: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  };
  interval: number | null;
  isSupported: boolean;
}

interface ShakeDetection {
  onShake?: (intensity: number) => void;
  threshold?: number;
}

export const useDeviceMotion = ({ onShake, threshold = 15 }: ShakeDetection = {}) => {
  const [motion, setMotion] = useState<DeviceMotionState>({
    acceleration: { x: null, y: null, z: null },
    accelerationIncludingGravity: { x: null, y: null, z: null },
    rotationRate: { alpha: null, beta: null, gamma: null },
    interval: null,
    isSupported: false,
  });

  const lastAccelerationRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Device Motion APIがサポートされているかチェック
    const isSupported = 'DeviceMotionEvent' in window;
    
    if (!isSupported) {
      setMotion(prev => ({ ...prev, isSupported: false }));
      return;
    }

    setMotion(prev => ({ ...prev, isSupported: true }));

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.acceleration || { x: 0, y: 0, z: 0 };
      const accelerationIncludingGravity = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      
      setMotion({
        acceleration: {
          x: acceleration.x,
          y: acceleration.y,
          z: acceleration.z,
        },
        accelerationIncludingGravity: {
          x: accelerationIncludingGravity.x,
          y: accelerationIncludingGravity.y,
          z: accelerationIncludingGravity.z,
        },
        rotationRate: {
          alpha: event.rotationRate?.alpha || null,
          beta: event.rotationRate?.beta || null,
          gamma: event.rotationRate?.gamma || null,
        },
        interval: event.interval,
        isSupported: true,
      });

      // シェイク検出
      if (onShake && acceleration.x !== null && acceleration.y !== null && acceleration.z !== null) {
        const deltaX = Math.abs(acceleration.x - lastAccelerationRef.current.x);
        const deltaY = Math.abs(acceleration.y - lastAccelerationRef.current.y);
        const deltaZ = Math.abs(acceleration.z - lastAccelerationRef.current.z);
        const totalDelta = deltaX + deltaY + deltaZ;

        if (totalDelta > threshold) {
          // シェイクが検出されたら、短時間内の重複検出を防ぐ
          if (!shakeTimeoutRef.current) {
            const intensity = Math.min(totalDelta / threshold, 3); // 最大3倍の強度
            onShake(intensity);
            
            shakeTimeoutRef.current = setTimeout(() => {
              shakeTimeoutRef.current = null;
            }, 500); // 500ms間は次のシェイクを検出しない
          }
        }

        lastAccelerationRef.current = {
          x: acceleration.x,
          y: acceleration.y,
          z: acceleration.z,
        };
      }
    };

    // iOS 13以降では許可が必要
    if (typeof (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function') {
      (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, [onShake, threshold]);

  return motion;
};