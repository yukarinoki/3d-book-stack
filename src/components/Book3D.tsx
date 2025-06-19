import { useRef, useState, useMemo } from 'react';
import { Mesh, Vector3, TextureLoader, SRGBColorSpace } from 'three';
import * as THREE from 'three';
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

  console.log(`Book3D - ${book.title} (${book.id}): isSelected = ${isSelected}, selectedBookIds = [${selectedBookIds.join(', ')}]`);

  // Convert millimeters to meters for physics
  const width = dimensions.width / 1000;
  const height = dimensions.height / 1000;
  const depth = dimensions.depth / 1000;

  // テクスチャを読み込む（textureUrlがある場合のみ）
  const texture = useMemo(() => {
    if (!textureUrl) {
      console.log(`[Book3D] ${book.title}: No texture URL provided`);
      return null;
    }

    console.log(`[Book3D] ${book.title}: Loading texture from ${textureUrl}`);

    try {
      const loader = new TextureLoader();
      const loadedTexture = loader.load(
        textureUrl,
        // onLoad callback
        (texture) => {
          console.log(`[Book3D] ${book.title}: Texture loaded successfully`, {
            image: texture.image,
            width: texture.image?.width,
            height: texture.image?.height,
            format: texture.format,
            colorSpace: texture.colorSpace
          });
        },
        // onProgress callback
        (progress) => {
          console.log(`[Book3D] ${book.title}: Loading progress`, progress);
        },
        // onError callback
        (error) => {
          console.error(`[Book3D] ${book.title}: Failed to load texture`, error);
        }
      );

      // テクスチャの設定を最適化してエッジを防ぐ
      loadedTexture.colorSpace = SRGBColorSpace;

      // テクスチャのラッピングモードを設定（エッジの問題を解決）
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
      // ベストな比率を設定した、変更禁止
      loadedTexture.repeat.set(0.82, 0.88);
      loadedTexture.offset.set(0.09, 0.065);

      // テクスチャのフィルタリングを設定（滑らかな表示）
      loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTexture.magFilter = THREE.LinearFilter;

      // アニソトロピックフィルタリングを有効化（角度による歪みを軽減）
      loadedTexture.anisotropy = 16;

      // ミップマップを生成
      loadedTexture.generateMipmaps = true;

      // テクスチャを更新
      loadedTexture.needsUpdate = true;

      console.log(`[Book3D] ${book.title}: Texture created with optimized settings`);

      return loadedTexture;
    } catch (error) {
      console.error(`[Book3D] ${book.title}: Exception while creating texture:`, error);
      return null;
    }
  }, [textureUrl, book.title]);

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
  console.log(`[Book3D] ${book.title}: Rendering with texture:`, !!texture);

  const bookMaterial = texture ? (
    <meshStandardMaterial
      map={texture}
      roughness={0.8}
      metalness={0.1}
      onUpdate={(material) => {
        console.log(`[Book3D] ${book.title}: Material updated with texture`, {
          map: material.map,
          mapIsTexture: material.map?.isTexture,
          needsUpdate: material.needsUpdate
        });
      }}
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
          console.log('Book3D onClick fired for book:', book.id, book.title);
          console.log('Ctrl/Meta key pressed:', e.ctrlKey || e.metaKey);
          console.log('Current selectedBookIds:', selectedBookIds);

          if (e.ctrlKey || e.metaKey) {
            console.log('Calling toggleBookSelection');
            toggleBookSelection(book.id);
          } else {
            console.log('Calling selectBook');
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
        colliders="cuboid"
      >
        <mesh
          ref={meshRef}
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
            console.log('Book3D onClick (physics) fired for book:', book.id, book.title);
            console.log('Ctrl/Meta key pressed:', e.ctrlKey || e.metaKey);
            console.log('Current selectedBookIds:', selectedBookIds);

            if (e.ctrlKey || e.metaKey) {
              console.log('Calling toggleBookSelection');
              toggleBookSelection(book.id);
            } else {
              console.log('Calling selectBook');
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
          <Html center>
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
