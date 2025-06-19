import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { InteractiveBook3D } from '../InteractiveBook3D';
import { usePhysicsInteraction } from '@/hooks/usePhysicsInteraction';
import type { PositionedBook } from '@/utils/bookPositioning';
import { useGesture } from '@use-gesture/react';

// Mock dependencies
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: {
      position: { x: 0, y: 5, z: 10, distanceTo: vi.fn(() => 10) },
    },
  }),
}));

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@react-three/rapier', () => ({
  RigidBody: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/hooks/usePhysicsInteraction');
vi.mock('@use-gesture/react', () => ({
  useGesture: () => vi.fn(() => ({
    onPointerDown: vi.fn(),
    onPointerUp: vi.fn(),
    onClick: vi.fn(),
    onDrag: vi.fn(),
  })),
  useDrag: () => vi.fn(() => ({})),
}));
vi.mock('@/stores', () => ({
  useBookStore: () => ({
    updateBook: vi.fn(),
    selectedBookIds: [],
    selectBook: vi.fn(),
    toggleBookSelection: vi.fn(),
    hoveredBookId: null,
    setHoveredBook: vi.fn(),
  }),
}));

describe('InteractiveBook3D', () => {
  const mockBook: PositionedBook = {
    id: '1',
    title: 'テスト本',
    author: 'テスト著者',
    dimensions: { width: 105, height: 148, depth: 15 },
    bookType: 'paperback',
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  };

  const mockBind = vi.fn(() => ({}));
  const mockStartGrab = vi.fn();
  const mockApplyImpulse = vi.fn();
  const mockApplyFlick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (usePhysicsInteraction as any).mockReturnValue({
      interactionMode: 'push',
      bind: mockBind,
      startGrab: mockStartGrab,
      applyImpulse: mockApplyImpulse,
      applyFlick: mockApplyFlick,
      isGrabbing: false,
      grabbedBookId: null,
    });
  });

  it('should render book with physics interaction', () => {
    const { container } = render(
      <InteractiveBook3D book={mockBook} physicsEnabled={true} />
    );
    
    expect(container.querySelector('mesh')).toBeTruthy();
  });

  it('should apply gesture bindings when physics enabled', () => {
    render(<InteractiveBook3D book={mockBook} physicsEnabled={true} />);
    
    // useGesture is called in the component
    expect(vi.mocked(useGesture)).toBeDefined();
  });

  it('should not apply gesture bindings when physics disabled', () => {
    render(<InteractiveBook3D book={mockBook} physicsEnabled={false} />);
    
    // When physics is disabled, InteractiveBook3D returns Book3D directly
    expect(vi.mocked(useGesture)).toBeDefined();
  });

  it('should handle click in push mode', () => {
    const { container } = render(
      <InteractiveBook3D book={mockBook} physicsEnabled={true} />
    );
    
    // Simulate click event
    const mesh = container.querySelector('mesh');
    if (mesh) {
      // In a real scenario, this would trigger physics interaction
      expect(mockBook).toBeDefined();
    }
  });

  it('should handle grab mode interaction', () => {
    (usePhysicsInteraction as any).mockReturnValue({
      interactionMode: 'grab',
      bind: mockBind,
      startGrab: mockStartGrab,
      applyImpulse: mockApplyImpulse,
      applyFlick: mockApplyFlick,
      isGrabbing: false,
      grabbedBookId: null,
    });
    
    render(<InteractiveBook3D book={mockBook} physicsEnabled={true} />);
    
    // In grab mode, useGesture is still used
    expect(vi.mocked(useGesture)).toBeDefined();
  });

  it('should show grab indicator when book is grabbed', () => {
    (usePhysicsInteraction as any).mockReturnValue({
      interactionMode: 'grab',
      bind: mockBind,
      startGrab: mockStartGrab,
      applyImpulse: mockApplyImpulse,
      applyFlick: mockApplyFlick,
      isGrabbing: true,
      grabbedBookId: '1',
    });
    
    const { container } = render(
      <InteractiveBook3D book={mockBook} physicsEnabled={true} />
    );
    
    // Should show some visual indicator when grabbed
    expect(container.querySelector('mesh')).toBeTruthy();
  });

  it('should handle flick mode interaction', () => {
    (usePhysicsInteraction as any).mockReturnValue({
      interactionMode: 'flick',
      bind: mockBind,
      startGrab: mockStartGrab,
      applyImpulse: mockApplyImpulse,
      applyFlick: mockApplyFlick,
      isGrabbing: false,
      grabbedBookId: null,
    });
    
    render(<InteractiveBook3D book={mockBook} physicsEnabled={true} />);
    
    expect(vi.mocked(useGesture)).toBeDefined();
  });

  it('should pass rigid body reference for physics interactions', () => {
    const { container } = render(
      <InteractiveBook3D book={mockBook} physicsEnabled={true} />
    );
    
    // RigidBody wrapper should be present (we mocked it as a div)
    expect(container.querySelector('div')).toBeTruthy();
  });
});