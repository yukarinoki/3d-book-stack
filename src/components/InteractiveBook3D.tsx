import { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { Book3D } from './Book3D';
import { usePhysicsInteraction } from '@/hooks/usePhysicsInteraction';
import type { PositionedBook } from '@/utils/bookPositioning';
import { useGesture } from '@use-gesture/react';
import { useThree } from '@react-three/fiber';

interface InteractiveBook3DProps {
  book: PositionedBook;
  physicsEnabled?: boolean;
  onDoubleClick?: () => void;
}

export const InteractiveBook3D = ({ book, physicsEnabled = true, onDoubleClick }: InteractiveBook3DProps) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const { 
    interactionMode, 
    startGrab, 
    endGrab,
    applyImpulse, 
    applyFlick,
    isGrabbing,
    grabbedBookId,
    updateGrabbedPosition,
  } = usePhysicsInteraction();

  // ジェスチャーバインディング
  const bind = useGesture({
    onPointerDown: ({ event }) => {
      if (!physicsEnabled || !rigidBodyRef.current) return;
      event.stopPropagation();
      
      if (interactionMode === 'grab') {
        startGrab(book.id, rigidBodyRef.current);
      }
    },
    onPointerUp: ({ event }) => {
      if (!physicsEnabled || !rigidBodyRef.current) return;
      event.stopPropagation();
      
      if (interactionMode === 'grab' && isGrabbing && grabbedBookId === book.id) {
        endGrab();
      }
    },
    onClick: ({ event }) => {
      if (!physicsEnabled || !rigidBodyRef.current) return;
      event.stopPropagation();
      
      if (interactionMode === 'push') {
        // クリック位置に基づいて押す方向を計算
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        applyImpulse(rigidBodyRef.current, { x: x * 50, y: y * 50 });
      }
    },
    onDrag: ({ velocity, movement, event }) => {
      if (!physicsEnabled || !rigidBodyRef.current) return;
      event.stopPropagation();
      
      if (interactionMode === 'grab' && isGrabbing && grabbedBookId === book.id) {
        // カメラからの距離を計算
        const position = rigidBodyRef.current.translation();
        const distance = camera.position.distanceTo({ x: position.x, y: position.y, z: position.z } as any);
        updateGrabbedPosition({ x: movement[0], y: movement[1] }, distance);
      } else if (interactionMode === 'flick' && velocity[0] ** 2 + velocity[1] ** 2 > 0.5) {
        applyFlick(rigidBodyRef.current, { x: velocity[0], y: velocity[1] });
      }
    },
  });

  // グラブ状態のビジュアルインジケーター
  const isBeingGrabbed = isGrabbing && grabbedBookId === book.id;

  if (!physicsEnabled) {
    return <Book3D book={book} physicsEnabled={false} onDoubleClick={onDoubleClick} />;
  }

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={book.position}
      rotation={book.rotation}
      restitution={0.2}
      friction={0.7}
      mass={1}
      colliders="cuboid"
    >
      <mesh {...bind()}>
        <Book3D 
          book={{
            ...book,
            // グラブ中は特別な色に
            color: isBeingGrabbed ? '#FFD700' : book.color,
          }} 
          physicsEnabled={false} // RigidBody内なのでBook3D自体の物理は無効
          onDoubleClick={onDoubleClick} 
        />
        
        {/* グラブ中のインジケーター */}
        {isBeingGrabbed && (
          <mesh scale={[1.1, 1.1, 1.1]}>
            <boxGeometry args={[
              book.dimensions.width / 1000 * 1.1,
              book.dimensions.height / 1000 * 1.1,
              book.dimensions.depth / 1000 * 1.1
            ]} />
            <meshBasicMaterial 
              color="#FFD700" 
              wireframe 
              transparent 
              opacity={0.5} 
            />
          </mesh>
        )}
      </mesh>
    </RigidBody>
  );
};