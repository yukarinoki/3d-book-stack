import { useRef } from 'react';
import { Mesh } from 'three';
import { RigidBody } from '@react-three/rapier';
import type { Book } from '@/types';

interface Book3DProps {
  book: Book;
  physicsEnabled?: boolean;
}

export const Book3D = ({ book, physicsEnabled = true }: Book3DProps) => {
  const meshRef = useRef<Mesh>(null);
  
  const { dimensions, position, rotation, color } = book;
  
  // Convert millimeters to meters for physics
  const width = dimensions.width / 1000;
  const height = dimensions.height / 1000;
  const depth = dimensions.depth / 1000;
  
  const bookGeometry = (
    <boxGeometry args={[width, height, depth]} />
  );
  
  const bookMaterial = (
    <meshStandardMaterial 
      color={color || '#8B4513'} 
      roughness={0.8}
      metalness={0.1}
    />
  );
  
  const bookMesh = (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      {bookGeometry}
      {bookMaterial}
    </mesh>
  );
  
  if (physicsEnabled) {
    return (
      <RigidBody
        type="dynamic"
        position={position}
        rotation={rotation}
        restitution={0.2}
        friction={0.7}
        mass={1}
      >
        <mesh
          castShadow
          receiveShadow
        >
          {bookGeometry}
          {bookMaterial}
        </mesh>
      </RigidBody>
    );
  }
  
  return bookMesh;
};