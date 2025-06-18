import { useRef, useMemo } from 'react';
import { Mesh, TextureLoader, SRGBColorSpace } from 'three';
import { RigidBody } from '@react-three/rapier';
import { useBookStore } from '@/stores';
import type { Book } from '@/types';

interface Book3DProps {
  book: Book;
  physicsEnabled?: boolean;
}

export const Book3D = ({ book, physicsEnabled = true }: Book3DProps) => {
  const meshRef = useRef<Mesh>(null);
  const { toggleBookSelection, selectedBookIds } = useBookStore();
  
  const { dimensions, position, rotation, color, textureUrl } = book;
  const isSelected = selectedBookIds.includes(book.id);
  
  // Convert millimeters to meters for physics
  const width = dimensions.width / 1000;
  const height = dimensions.height / 1000;
  const depth = dimensions.depth / 1000;
  
  // テクスチャを読み込む（textureUrlがある場合のみ）
  const texture = useMemo(() => {
    if (!textureUrl) return null;
    try {
      const loader = new TextureLoader();
      const loadedTexture = loader.load(textureUrl);
      loadedTexture.colorSpace = SRGBColorSpace;
      return loadedTexture;
    } catch (error) {
      console.error('Failed to load texture:', error);
      return null;
    }
  }, [textureUrl]);
  
  const bookGeometry = (
    <boxGeometry args={[width, height, depth]} />
  );
  
  // テクスチャがある場合とない場合でマテリアルを切り替え
  const bookMaterial = texture ? (
    <meshStandardMaterial 
      map={texture}
      roughness={0.8}
      metalness={0.1}
    />
  ) : (
    <meshStandardMaterial 
      color={color || '#8B4513'} 
      roughness={0.8}
      metalness={0.1}
    />
  );
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookSelection(book.id);
  };

  const bookMesh = (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
      onClick={handleClick}
    >
      {bookGeometry}
      {bookMaterial}
      {/* 選択状態を示すアウトライン */}
      {isSelected && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial color="#4ECDC4" wireframe />
        </mesh>
      )}
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
          onClick={handleClick}
        >
          {bookGeometry}
          {bookMaterial}
          {/* 選択状態を示すアウトライン */}
          {isSelected && (
            <mesh scale={[1.05, 1.05, 1.05]}>
              <boxGeometry args={[width, height, depth]} />
              <meshBasicMaterial color="#4ECDC4" wireframe />
            </mesh>
          )}
        </mesh>
      </RigidBody>
    );
  }
  
  return bookMesh;
};