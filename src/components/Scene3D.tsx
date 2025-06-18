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
          position: [0, 5, 10],
          fov: 45,
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
            target={[0, 0, 0]}
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