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

  const { dimensions, position, rotation, color, textureUrl, spineTextureUrl, backCoverTextureUrl, topBottomTextureUrl, edgeColor } = book;
  const isSelected = selectedBookIds.includes(book.id);
  const isHovered = hoveredBookId === book.id;

  console.log(`Book3D - ${book.title} (${book.id}): isSelected = ${isSelected}, selectedBookIds = [${selectedBookIds.join(', ')}]`);

  // Convert millimeters to meters for physics
  const width = dimensions.width / 1000;
  const height = dimensions.height / 1000;
  const depth = dimensions.depth / 1000;

  // テクスチャを読み込む汎用関数
  const loadTextureWithSettings = (url: string | undefined, faceName: string) => {
    if (!url) {
      console.log(`[Book3D] ${book.title}: No ${faceName} texture URL provided`);
      return null;
    }

    console.log(`[Book3D] ${book.title}: Loading ${faceName} texture from ${url}`);

    try {
      const loader = new TextureLoader();
      const loadedTexture = loader.load(
        url,
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

      // 各面に応じたrepeatとoffset設定
      switch (faceName) {
        case 'front':
        case 'back':
          // 表紙・裏表紙用の設定
          loadedTexture.repeat.set(0.82, 0.88);
          loadedTexture.offset.set(0.09, 0.065);
          break;
        case 'spine':
          // 背表紙用の設定（細長い面なので調整）
          loadedTexture.repeat.set(0.95, 0.9);
          loadedTexture.offset.set(0.025, 0.05);
          break;
        case 'topBottom':
          // 天地用の設定（横長の面なので調整）
          loadedTexture.repeat.set(0.95, 0.9);
          loadedTexture.offset.set(0.025, 0.05);
          break;
      }

      // テクスチャのフィルタリングを設定（滑らかな表示）
      loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTexture.magFilter = THREE.LinearFilter;

      // アニソトロピックフィルタリングを有効化（角度による歪みを軽減）
      loadedTexture.anisotropy = 16;

      // ミップマップを生成
      loadedTexture.generateMipmaps = true;

      // テクスチャを更新
      loadedTexture.needsUpdate = true;

      console.log(`[Book3D] ${book.title}: ${faceName} texture created with optimized settings`);

      return loadedTexture;
    } catch (error) {
      console.error(`[Book3D] ${book.title}: Exception while creating ${faceName} texture:`, error);
      return null;
    }
  };

  // 各面のテクスチャを読み込む
  const frontTexture = useMemo(() => loadTextureWithSettings(textureUrl, 'front'), [textureUrl, book.title]);
  const spineTexture = useMemo(() => loadTextureWithSettings(spineTextureUrl, 'spine'), [spineTextureUrl, book.title]);
  const backTexture = useMemo(() => loadTextureWithSettings(backCoverTextureUrl, 'back'), [backCoverTextureUrl, book.title]);
  const topBottomTexture = useMemo(() => loadTextureWithSettings(topBottomTextureUrl, 'topBottom'), [topBottomTextureUrl, book.title]);

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

  // 各面のマテリアルを定義
  const defaultColor = isSelected ? '#FFD700' : (isHovered ? '#A0522D' : (color || '#8B4513'));
  const edgeMaterialColor = edgeColor || '#F5DEB3'; // デフォルトはクリーム色

  // 6面のマテリアルをJSXで定義（BoxGeometryの面の順番: 右、左、上、下、前、後）
  const renderMaterials = () => (
    <>
      {/* 0: 右面（+X） - 小口 */}
      <meshStandardMaterial
        attach="material-0"
        color={edgeMaterialColor}
        roughness={0.8}
        metalness={0.1}
      />

      {/* 1: 左面（-X） - 背表紙 */}
      {spineTexture ? (
        <meshStandardMaterial
          attach="material-1"
          map={spineTexture}
          roughness={0.8}
          metalness={0.1}
        />
      ) : (
        <meshStandardMaterial
          attach="material-1"
          color={defaultColor}
          roughness={0.8}
          metalness={0.1}
          emissive={isSelected ? '#FFD700' : undefined}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      )}

      {/* 2: 上面（+Y） - 天 */}
      {topBottomTexture ? (
        <meshStandardMaterial
          attach="material-2"
          map={topBottomTexture}
          roughness={0.8}
          metalness={0.1}
        />
      ) : (
        <meshStandardMaterial
          attach="material-2"
          color={defaultColor}
          roughness={0.8}
          metalness={0.1}
          emissive={isSelected ? '#FFD700' : undefined}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      )}

      {/* 3: 下面（-Y） - 地 */}
      {topBottomTexture ? (
        <meshStandardMaterial
          attach="material-3"
          map={topBottomTexture}
          roughness={0.8}
          metalness={0.1}
        />
      ) : (
        <meshStandardMaterial
          attach="material-3"
          color={defaultColor}
          roughness={0.8}
          metalness={0.1}
          emissive={isSelected ? '#FFD700' : undefined}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      )}

      {/* 4: 前面（+Z） - 表紙 */}
      {frontTexture ? (
        <meshStandardMaterial
          attach="material-4"
          map={frontTexture}
          roughness={0.8}
          metalness={0.1}
        />
      ) : (
        <meshStandardMaterial
          attach="material-4"
          color={defaultColor}
          roughness={0.8}
          metalness={0.1}
          emissive={isSelected ? '#FFD700' : undefined}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      )}

      {/* 5: 後面（-Z） - 裏表紙 */}
      {backTexture ? (
        <meshStandardMaterial
          attach="material-5"
          map={backTexture}
          roughness={0.8}
          metalness={0.1}
        />
      ) : (
        <meshStandardMaterial
          attach="material-5"
          color={defaultColor}
          roughness={0.8}
          metalness={0.1}
          emissive={isSelected ? '#FFD700' : undefined}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      )}
    </>
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
        {renderMaterials()}
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
          {renderMaterials()}
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
