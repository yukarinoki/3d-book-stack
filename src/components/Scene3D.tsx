import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense, useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useBookStore } from '@/stores';
import { useDeviceOrientation, useDeviceMotion, useTouchGestures } from '@/hooks';

interface Scene3DProps {
  children: ReactNode;
  physicsEnabled?: boolean;
}

// モバイルセンサーによるカメラコントロール
const MobileCameraController = () => {
  const { camera } = useThree();
  const orientation = useDeviceOrientation();
  const [enableSensorControl, setEnableSensorControl] = useState(false);
  const initialOrientationRef = useRef<{ beta: number; gamma: number } | null>(null);

  useEffect(() => {
    // モバイルデバイスかどうかをチェック
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setEnableSensorControl(isMobile && orientation.isSupported);
  }, [orientation.isSupported]);

  useFrame(() => {
    if (!enableSensorControl || orientation.beta === null || orientation.gamma === null) return;

    // 初期の向きを記録
    if (!initialOrientationRef.current) {
      initialOrientationRef.current = {
        beta: orientation.beta,
        gamma: orientation.gamma,
      };
    }

    // デバイスの傾きに基づいてカメラを回転
    const deltaBeta = (orientation.beta - initialOrientationRef.current.beta) * 0.01;
    const deltaGamma = (orientation.gamma - initialOrientationRef.current.gamma) * 0.01;

    // カメラの位置を球面座標で計算
    const radius = 5;
    const phi = Math.PI / 2 - deltaBeta; // 垂直角度
    const theta = deltaGamma; // 水平角度

    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    
    camera.lookAt(0, 0.5, 0);
  });

  return null;
};

export const Scene3D = ({ children, physicsEnabled = true }: Scene3DProps) => {
  const { clearSelection } = useBookStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);

  // シェイク検出とジェスチャー
  const motion = useDeviceMotion({
    onShake: (intensity) => {
      // シェイクで本を跳ね上げる
      if (physicsEnabled) {
        // 物理エンジンに力を加える処理は子コンポーネントで実装
        window.dispatchEvent(new CustomEvent('shake-books', { detail: { intensity } }));
      }
    },
    threshold: 15,
  });

  const touchGestures = useTouchGestures({
    onPinch: (scale) => {
      // ピンチでズーム（OrbitControlsと連携）
      window.dispatchEvent(new CustomEvent('pinch-zoom', { detail: { scale } }));
    },
    onSwipe: (direction) => {
      // スワイプで表示モード切り替え
      if (direction === 'left' || direction === 'right') {
        window.dispatchEvent(new CustomEvent('swipe-mode', { detail: { direction } }));
      }
    },
    onDoubleTap: () => {
      // ダブルタップでリセット
      window.dispatchEvent(new CustomEvent('reset-view'));
    },
  });

  useEffect(() => {
    // モバイルデバイスかどうかをチェック
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkMobile);
    setShowMobileControls(checkMobile && (motion.isSupported || touchGestures.touchCount > 0));
  }, [motion.isSupported, touchGestures.touchCount]);
  
  return (
    <div className="w-full h-full relative">
      {showMobileControls && (
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white p-2 rounded-lg text-sm">
          <p>📱 モバイルコントロール有効</p>
          <p className="text-xs mt-1">
            • デバイスを傾けてカメラ移動<br />
            • ピンチでズーム<br />
            • シェイクで本を跳ね上げ<br />
            • ダブルタップでリセット
          </p>
        </div>
      )}
      <Canvas
        onPointerMissed={() => clearSelection()}
        camera={{
          position: [3, 0.1, 2], // 斜め上から見下ろす位置（水平な本がよく見える）
          fov: 25, // 視野角を調整して適切な拡大率を得る
        }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />

          <Environment preset="studio" />

          {isMobile ? (
            <>
              <MobileCameraController />
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={false}
                target={[0, 0.5, 0]}
              />
            </>
          ) : (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              target={[0, 0.5, 0]} // 本のスタック中央を見る（水平配置に合わせて調整）
            />
          )}

          {physicsEnabled ? (
            <Physics gravity={[0, -9.81, 0]}>
              {children}
            </Physics>
          ) : (
            children
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
