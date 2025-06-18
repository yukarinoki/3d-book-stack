import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { useBookStore } from '@/stores';

interface Scene3DProps {
  children: ReactNode;
  physicsEnabled?: boolean;
}

export const Scene3D = ({ children, physicsEnabled = true }: Scene3DProps) => {
  const { clearSelection, setHoveredBook, viewMode } = useBookStore();
  
  // 表示モードに応じてカメラ位置を設定
  const getCameraPosition = (): [number, number, number] => {
    switch (viewMode) {
      case 'stack':
        // 背表紙側から見る（Z軸のマイナス方向から）、より低い位置
        return [0, 0.2, 3];
      case 'grid':
        // 真上から見下ろす
        return [0, 5, 0];
      case 'shelf':
        // 正面からほぼ水平に見る
        return [0, 0.15, 4];
      default:
        return [3, 0.1, 2];
    }
  };
  
  // 表示モードに応じてカメラのターゲットを設定
  const getCameraTarget = (): [number, number, number] => {
    switch (viewMode) {
      case 'stack':
        // スタックの少し下の方を見る
        return [0, 0.3, 0];
      case 'grid':
        // 真下を見る
        return [0, 0, 0];
      case 'shelf':
        // 本棚の下の方を見る
        return [0, 0.1, 0];
      default:
        return [0, 0.5, 0];
    }
  };
  
  return (
    <div className="w-full h-full">
      <Canvas
        onPointerMissed={() => {
          clearSelection();
          setHoveredBook(null);
        }}
        camera={{
          position: getCameraPosition(),
          fov: viewMode === 'grid' ? 50 : 25, // 表紙並べの時は視野角を広く
        }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={0.3} castShadow />

          <Environment preset="studio" background={false} />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={getCameraTarget()}
          />

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
