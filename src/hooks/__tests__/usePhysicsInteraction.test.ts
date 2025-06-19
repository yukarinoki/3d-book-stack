import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhysicsInteraction } from '../usePhysicsInteraction';
import { Vector3 } from 'three';

// Mock useThree
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: {
      position: new Vector3(0, 5, 10),
    },
    scene: {
      children: [],
    },
  }),
}));

// Mock useGesture
vi.mock('@use-gesture/react', () => ({
  useGesture: () => {
    return () => ({
      onPointerDown: vi.fn(),
      onPointerMove: vi.fn(),
      onPointerUp: vi.fn(),
    });
  },
}));

// Mock RigidBody
const mockRigidBody = {
  applyImpulse: vi.fn(),
  translation: () => ({ x: 0, y: 0, z: 0 }),
  setTranslation: vi.fn(),
};

describe('usePhysicsInteraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    expect(result.current.isGrabbing).toBe(false);
    expect(result.current.grabbedBookId).toBe(null);
    expect(result.current.interactionMode).toBe('push');
  });

  it('should handle book grabbing', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    act(() => {
      result.current.startGrab('book-1', mockRigidBody as any);
    });
    
    expect(result.current.isGrabbing).toBe(true);
    expect(result.current.grabbedBookId).toBe('book-1');
  });

  it('should release grabbed book', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    act(() => {
      result.current.startGrab('book-1', mockRigidBody as any);
    });
    
    expect(result.current.isGrabbing).toBe(true);
    
    act(() => {
      result.current.endGrab();
    });
    
    expect(result.current.isGrabbing).toBe(false);
    expect(result.current.grabbedBookId).toBe(null);
  });

  it('should switch interaction modes', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    expect(result.current.interactionMode).toBe('push');
    
    act(() => {
      result.current.setInteractionMode('grab');
    });
    
    expect(result.current.interactionMode).toBe('grab');
    
    act(() => {
      result.current.setInteractionMode('flick');
    });
    
    expect(result.current.interactionMode).toBe('flick');
  });

  it('should apply impulse to book in push mode', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    act(() => {
      result.current.applyImpulse(mockRigidBody as any, { x: 10, y: 0 });
    });
    
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
    const impulseCall = mockRigidBody.applyImpulse.mock.calls[0];
    expect(impulseCall[0]).toMatchObject({ x: expect.any(Number), y: expect.any(Number), z: expect.any(Number) });
    expect(impulseCall[1]).toBe(true); // wakeUp parameter
  });

  it('should calculate flick force based on gesture speed', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    act(() => {
      result.current.setInteractionMode('flick');
    });
    
    const velocity = { x: 5, y: -3 };
    act(() => {
      result.current.applyFlick(mockRigidBody as any, velocity);
    });
    
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
    const impulseCall = mockRigidBody.applyImpulse.mock.calls[0];
    
    // フリック時は速度に応じた力が加わる
    expect(impulseCall[0].y).toBeGreaterThan(0); // 上向きの力
  });

  it('should update grabbed book position during drag', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    act(() => {
      result.current.setInteractionMode('grab');
      result.current.startGrab('book-1', mockRigidBody as any);
    });
    
    const movement = { x: 50, y: -30 };
    const cameraDistance = 10;
    act(() => {
      result.current.updateGrabbedPosition(movement, cameraDistance);
    });
    
    expect(mockRigidBody.setTranslation).toHaveBeenCalled();
  });

  it('should not update position when no book is grabbed', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    const movement = { x: 50, y: -30 };
    const cameraDistance = 10;
    act(() => {
      result.current.updateGrabbedPosition(movement, cameraDistance);
    });
    
    expect(mockRigidBody.setTranslation).not.toHaveBeenCalled();
  });

  it('should handle multi-touch gestures', () => {
    const { result } = renderHook(() => usePhysicsInteraction());
    
    act(() => {
      result.current.setInteractionMode('grab');
    });
    
    // 2本指でのピンチジェスチャーのシミュレート
    const pinchScale = 1.5;
    act(() => {
      result.current.handlePinch(mockRigidBody as any, pinchScale);
    });
    
    // ピンチによる本の回転または拡大縮小の効果を検証
    expect(mockRigidBody.applyImpulse).toHaveBeenCalled();
  });
});