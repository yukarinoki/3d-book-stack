import { describe, it, expect, vi } from 'vitest';
import { Floor } from '../Floor';

// Mock react-three/rapier
vi.mock('@react-three/rapier', () => ({
  RigidBody: vi.fn(({ children, type, friction }: any) => {
    expect(type).toBe('fixed');
    expect(friction).toBe(0.6);
    return children;
  }),
}));

describe('Floor', () => {
  it('should be a function component', () => {
    expect(typeof Floor).toBe('function');
  });

  it('should accept size and position props', () => {
    const floorWithSize = Floor({ size: 30 });
    const floorWithPosition = Floor({ position: [0, -1, 0] });
    const floorWithBoth = Floor({ size: 40, position: [0, -2, 0] });
    
    expect(floorWithSize).toBeDefined();
    expect(floorWithPosition).toBeDefined();
    expect(floorWithBoth).toBeDefined();
  });

  it('should have default size and position values', () => {
    const defaultFloor = Floor({});
    expect(defaultFloor).toBeDefined();
  });

  it('should export Floor component', () => {
    expect(Floor).toBeDefined();
    expect(Floor.name).toBe('Floor');
  });
});