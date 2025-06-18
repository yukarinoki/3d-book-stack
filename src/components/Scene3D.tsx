import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import type { ReactNode } from 'react';

interface Scene3DProps {
  children: ReactNode;
  physicsEnabled?: boolean;
}

export const Scene3D = ({ children, physicsEnabled = true }: Scene3DProps) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{
          position: [2, 1.5, 2], // 斜め上から見下ろす位置（水平な本がよく見える）
          fov: 35, // 視野角を調整して適切な拡大率を得る
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
