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
          position: [3, 0.1, 0], // 真横から見る位置（X軸から、本のスタック中央の高さ）
          fov: 25, // 視野角を狭めて拡大効果を得る
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
            target={[0, 0.1, 0]} // 本のスタック中央を見る
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