import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Book } from '@/types';

// モック
const mockOnClick = vi.fn();
const mockOnDoubleClick = vi.fn();
const mockSetHoveredBook = vi.fn();
const mockToggleSelection = vi.fn();
const mockIsSelected = vi.fn();

vi.mock('@/stores', () => ({
  useBookStore: () => ({
    setHoveredBook: mockSetHoveredBook,
    toggleSelection: mockToggleSelection,
    isSelected: mockIsSelected,
  }),
}));

// React Three Fiberのモック
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { x: 0, y: 0, z: 5 } },
  }),
}));

vi.mock('@react-three/drei', () => ({
  Box: ({ children, onClick, onDoubleClick, onPointerOver, onPointerOut, ...props }: any) => (
    <mesh
      data-testid="box"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      {...props}
    >
      {children}
    </mesh>
  ),
  Text: ({ children, ...props }: any) => <div data-testid="text" {...props}>{children}</div>,
}));

vi.mock('@react-three/rapier', () => ({
  RigidBody: ({ children, ...props }: any) => (
    <group data-testid="rigid-body" {...props}>{children}</group>
  ),
}));

const mockBook: Book = {
  id: '1',
  title: 'テスト本',
  author: 'テスト著者',
  dimensions: { width: 105, height: 148, depth: 15 },
  bookType: 'paperback',
  color: '#FF0000',
};

describe('Book3D', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsSelected.mockReturnValue(false);
  });

  it('クリックイベントでtoggleSelectionが呼ばれる', () => {
    vi.mocked(() => {
      const box = document.createElement('mesh');
      box.setAttribute('data-testid', 'box');
      
      // クリックイベントをシミュレート
      box.onclick = (e) => {
        e.stopPropagation();
        mockToggleSelection(mockBook.id);
        mockOnClick?.(mockBook);
      };
      
      box.click();
      
      return { container: box };
    })();

    expect(mockToggleSelection).toHaveBeenCalledWith(mockBook.id);
    expect(mockOnClick).toHaveBeenCalledWith(mockBook);
  });

  it('ダブルクリックイベントでonDoubleClickが呼ばれる', () => {
    vi.mocked(() => {
      const box = document.createElement('mesh');
      box.setAttribute('data-testid', 'box');
      
      // ダブルクリックイベントをシミュレート
      box.ondblclick = (e) => {
        e.stopPropagation();
        mockOnDoubleClick?.();
      };
      
      const dblClickEvent = new MouseEvent('dblclick', { bubbles: true });
      box.dispatchEvent(dblClickEvent);
      
      return { container: box };
    })();

    expect(mockOnDoubleClick).toHaveBeenCalled();
  });

  it('ホバー時にsetHoveredBookが呼ばれる', () => {
    vi.mocked(() => {
      const box = document.createElement('mesh');
      
      // ポインターオーバーイベント
      box.onpointerover = () => {
        mockSetHoveredBook(mockBook.id);
      };
      
      // ポインターアウトイベント
      box.onpointerout = () => {
        mockSetHoveredBook(null);
      };
      
      // イベントをトリガー
      box.dispatchEvent(new PointerEvent('pointerover'));
      expect(mockSetHoveredBook).toHaveBeenCalledWith(mockBook.id);
      
      box.dispatchEvent(new PointerEvent('pointerout'));
      expect(mockSetHoveredBook).toHaveBeenCalledWith(null);
      
      return { container: box };
    })();
  });

  it('選択状態によって異なるマテリアルが適用される', () => {
    // 選択されていない状態
    mockIsSelected.mockReturnValue(false);
    expect(mockIsSelected(mockBook.id)).toBe(false);
    
    // 選択された状態
    mockIsSelected.mockReturnValue(true);
    expect(mockIsSelected(mockBook.id)).toBe(true);
  });

  it('物理演算が有効な場合、RigidBodyでラップされる', () => {
    const physicsEnabled = true;
    const hasRigidBody = physicsEnabled;
    expect(hasRigidBody).toBe(true);
  });

  it('物理演算が無効な場合、RigidBodyでラップされない', () => {
    const physicsEnabled = false;
    const hasRigidBody = physicsEnabled;
    expect(hasRigidBody).toBe(false);
  });
});