import { useState, useCallback, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useGesture } from '@use-gesture/react';
import { Vector3 } from 'three';
import type { RapierRigidBody } from '@react-three/rapier';

export type InteractionMode = 'push' | 'grab' | 'flick';

interface GestureState {
  movement: [number, number];
  velocity: [number, number];
  direction: [number, number];
  distance: [number, number];
  down: boolean;
}

export const usePhysicsInteraction = () => {
  const { camera } = useThree();
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [grabbedBookId, setGrabbedBookId] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('push');
  const grabbedBodyRef = useRef<RapierRigidBody | null>(null);
  const initialPositionRef = useRef<Vector3 | null>(null);

  // 本をつかむ
  const startGrab = useCallback((bookId: string, rigidBody: RapierRigidBody) => {
    setIsGrabbing(true);
    setGrabbedBookId(bookId);
    grabbedBodyRef.current = rigidBody;
    
    const position = rigidBody.translation();
    initialPositionRef.current = new Vector3(position.x, position.y, position.z);
  }, []);

  // 本を離す
  const endGrab = useCallback(() => {
    setIsGrabbing(false);
    setGrabbedBookId(null);
    grabbedBodyRef.current = null;
    initialPositionRef.current = null;
  }, []);

  // つかんだ本の位置を更新
  const updateGrabbedPosition = useCallback((movement: { x: number; y: number }) => {
    if (!grabbedBodyRef.current || !initialPositionRef.current) return;
    
    // カメラからの距離に基づいて移動量を調整
    const cameraDistance = camera.position.distanceTo(initialPositionRef.current);
    const factor = cameraDistance * 0.001;
    
    const newPosition = {
      x: initialPositionRef.current.x + movement.x * factor,
      y: initialPositionRef.current.y - movement.y * factor,
      z: initialPositionRef.current.z,
    };
    
    grabbedBodyRef.current.setTranslation(newPosition, true);
  }, [camera]);

  // プッシュモードで力を加える
  const applyImpulse = useCallback((rigidBody: RapierRigidBody, movement: { x: number; y: number }) => {
    if (interactionMode !== 'push') return;
    
    // カメラの向きに基づいて力の方向を計算
    const force = new Vector3(movement.x * 0.1, Math.abs(movement.y) * 0.1, -movement.y * 0.1);
    rigidBody.applyImpulse(force, true);
  }, [interactionMode]);

  // フリックモードで本を弾く
  const applyFlick = useCallback((rigidBody: RapierRigidBody, velocity: { x: number; y: number }) => {
    if (interactionMode !== 'flick') return;
    
    // 速度に基づいて強い上向きの力を加える
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    const force = new Vector3(
      velocity.x * 0.5,
      Math.max(speed * 0.8, 2), // 最小でも2の上向き力
      -velocity.y * 0.5
    );
    
    rigidBody.applyImpulse(force, true);
  }, [interactionMode]);

  // ピンチジェスチャーで本を回転
  const handlePinch = useCallback((rigidBody: RapierRigidBody, scale: number) => {
    // ピンチの大きさに基づいて回転トルクを加える
    const torque = new Vector3(0, (scale - 1) * 5, 0);
    rigidBody.applyImpulse(torque, true);
  }, []);

  // ジェスチャーのバインド
  const bind = useGesture({
    onDrag: ({ movement }: GestureState) => {
      if (interactionMode === 'grab' && isGrabbing) {
        updateGrabbedPosition({ x: movement[0], y: movement[1] });
      }
    },
    onDragEnd: () => {
      if (interactionMode === 'grab' && isGrabbing) {
        endGrab();
      }
    },
  });
  
  // bindが関数を返すことを保証
  const bindProps = useCallback(() => {
    const props = bind();
    return props || {};
  }, [bind]);

  return {
    isGrabbing,
    grabbedBookId,
    interactionMode,
    setInteractionMode,
    startGrab,
    endGrab,
    applyImpulse,
    applyFlick,
    handlePinch,
    updateGrabbedPosition,
    bind: bindProps,
  };
};