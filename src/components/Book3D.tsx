import { useRef, useState, useMemo } from 'react';
import { Mesh, Vector3, TextureLoader, SRGBColorSpace } from 'three';
import { RigidBody } from '@react-three/rapier';
import { useDrag } from '@use-gesture/react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Book } from '@/types';
import { useBookStore } from '@/stores';

interface Book3DProps {
  book: Book;
  physicsEnabled?: boolean;
  onDoubleClick?: () => void;
}

export const Book3D = ({ book, physicsEnabled = true, onDoubleClick }: Book3DProps) => {
  const meshRef = useRef<Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { camera } = useThree();
  const { updateBook, selectedBookIds, selectBook, toggleBookSelection, hoveredBookId, setHoveredBook } = useBookStore();
  
  const { dimensions, position, rotation, color, textureUrl } = book;
  const isSelected = selectedBookIds.includes(book.id);
  const isHovered = hoveredBookId === book.id;
  
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
  
  // ドラッグ機能の実装
  const bind = useDrag(({ active, movement: [x, y] }) => {
    if (!physicsEnabled && meshRef.current) {
      const distance = camera.position.distanceTo(new Vector3(...(position || [0, 0, 0])));
      const factor = distance * 0.001;
      
      const newPosition: [number, number, number] = [
        (position?.[0] || 0) + x * factor,
        (position?.[1] || 0),
        (position?.[2] || 0) - y * factor
      ];
      
      if (active) {
        meshRef.current.position.set(...newPosition);
      } else {
        updateBook(book.id, { position: newPosition });
      }
    }
    setIsDragging(active);
  });
  
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
      color={isSelected ? '#FFD700' : (isHovered ? '#A0522D' : (color || '#8B4513'))} 
      roughness={0.8}
      metalness={0.1}
      emissive={isSelected ? '#FFD700' : undefined}
      emissiveIntensity={isSelected ? 0.2 : 0}
    />
  );
  
  const bookMesh = (
    <>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        castShadow
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredBook(book.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          if (hoveredBookId === book.id) {
            setHoveredBook(null);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (e.ctrlKey || e.metaKey) {
            toggleBookSelection(book.id);
          } else {
            selectBook(book.id);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onDoubleClick) {
            onDoubleClick();
          }
        }}
        {...(!physicsEnabled ? bind() : {})}
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
      {isHovered && !isDragging && (
        <Html position={position} center>
          <div className="bg-black bg-opacity-80 text-white p-2 rounded-md text-sm whitespace-nowrap">
            <div className="font-bold">{book.title}</div>
            <div className="text-xs">{book.author}</div>
          </div>
        </Html>
      )}
    </>
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
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredBook(book.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (hoveredBookId === book.id) {
              setHoveredBook(null);
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.ctrlKey || e.metaKey) {
              toggleBookSelection(book.id);
            } else {
              selectBook(book.id);
            }
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (onDoubleClick) {
              onDoubleClick();
            }
          }}
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
        {isHovered && (
          <Html position={position} center>
            <div className="bg-black bg-opacity-80 text-white p-2 rounded-md text-sm whitespace-nowrap">
              <div className="font-bold">{book.title}</div>
              <div className="text-xs">{book.author}</div>
            </div>
          </Html>
        )}
      </RigidBody>
    );
  }
  
  return bookMesh;
};