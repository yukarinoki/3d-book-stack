import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BookShelfSupport } from '../BookShelfSupport';

// モック
vi.mock('@react-three/fiber', () => ({
  extend: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Box: ({ children, position, ...props }: any) => (
    <mesh data-testid="box" data-position={JSON.stringify(position)} {...props}>
      {children}
    </mesh>
  ),
}));

vi.mock('@react-three/rapier', () => ({
  RigidBody: ({ children, position, ...props }: any) => (
    <group data-testid="rigid-body" data-position={JSON.stringify(position)} {...props}>
      {children}
    </group>
  ),
}));

describe('BookShelfSupport', () => {
  it('物理演算が有効な場合、RigidBodyでラップされる', () => {
    const { getByTestId } = render(
      <BookShelfSupport position={[0, 0, 0]} physicsEnabled={true} />
    );
    
    const rigidBody = getByTestId('rigid-body');
    expect(rigidBody).toBeTruthy();
  });

  it('物理演算が無効な場合、直接meshが描画される', () => {
    const { getByTestId, queryByTestId } = render(
      <BookShelfSupport position={[0, 0, 0]} physicsEnabled={false} />
    );
    
    const box = getByTestId('box');
    expect(box).toBeTruthy();
    const rigidBody = queryByTestId('rigid-body');
    expect(rigidBody).toBeFalsy();
  });

  it('正しい位置に配置される', () => {
    const position: [number, number, number] = [1, 2, 3];
    const { getByTestId } = render(
      <BookShelfSupport position={position} physicsEnabled={true} />
    );
    
    const rigidBody = getByTestId('rigid-body');
    expect(rigidBody.getAttribute('data-position')).toBe(JSON.stringify(position));
  });

  it('デフォルトで物理演算が有効', () => {
    const { getByTestId } = render(
      <BookShelfSupport position={[0, 0, 0]} />
    );
    
    const rigidBody = getByTestId('rigid-body');
    expect(rigidBody).toBeTruthy();
  });

  it('正しいサイズの支えが作成される', () => {
    const { container } = render(
      <BookShelfSupport position={[0, 0, 0]} physicsEnabled={false} />
    );
    
    const mesh = container.querySelector('mesh');
    expect(mesh?.getAttribute('args')).toBe('0.02,0.25,0.15');
  });
});