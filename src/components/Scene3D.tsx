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
  const { clearSelection, setHoveredBook } = useBookStore();
  
  return (
    <div className="w-full h-full">
      <Canvas
        onPointerMissed={() => {
          clearSelection();
          setHoveredBook(null);
        }}
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

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 0.5, 0]} // 本のスタック中央を見る（水平配置に合わせて調整）
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
