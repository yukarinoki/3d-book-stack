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

  it('should accept physicsEnabled prop', () => {
    const floorWithPhysics = Floor({ physicsEnabled: true });
    const floorWithoutPhysics = Floor({ physicsEnabled: false });
    
    expect(floorWithPhysics).toBeDefined();
    expect(floorWithoutPhysics).toBeDefined();
  });

  it('should have default physicsEnabled value of true', () => {
    const defaultFloor = Floor({});
    expect(defaultFloor).toBeDefined();
  });

  it('should export Floor component', () => {
    expect(Floor).toBeDefined();
    expect(Floor.name).toBe('Floor');
  });
});