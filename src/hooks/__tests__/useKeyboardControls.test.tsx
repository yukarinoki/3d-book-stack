import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardControls } from '../useKeyboardControls';

// モック
const mockMoveBook = vi.fn();
const mockTogglePhysics = vi.fn();
const mockGetState = vi.fn();

vi.mock('@/stores', () => ({
  useBookStore: () => ({
    selectedBookIds: mockGetState().selectedBookIds || [],
    books: mockGetState().books || [],
    physicsEnabled: mockGetState().physicsEnabled || false,
    setPhysicsEnabled: mockTogglePhysics,
    updateBook: mockMoveBook,
  }),
}));

describe('useKeyboardControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetState.mockReturnValue({
      selectedBookIds: [],
      physicsEnabled: false,
    });
  });

  afterEach(() => {
    // イベントリスナーのクリーンアップ
    vi.restoreAllMocks();
  });

  it('選択された本がない場合、WASDキーを押しても何も起こらない', () => {
    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: 'w' });
    document.dispatchEvent(event);

    expect(mockMoveBook).not.toHaveBeenCalled();
  });

  it('本が選択されている時、Wキーで前方に移動', () => {
    mockGetState.mockReturnValue({
      selectedBookIds: ['book1'],
      books: [{ id: 'book1', position: [0, 0, 0] }],
      physicsEnabled: false,
    });

    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: 'w' });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(mockMoveBook).toHaveBeenCalledWith('book1', {
      position: expect.arrayContaining([
        0,
        0,
        -0.1,
      ]),
    });
  });

  it('本が選択されている時、Sキーで後方に移動', () => {
    mockGetState.mockReturnValue({
      selectedBookIds: ['book1'],
      books: [{ id: 'book1', position: [0, 0, 0] }],
      physicsEnabled: false,
    });

    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: 's' });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(mockMoveBook).toHaveBeenCalledWith('book1', {
      position: expect.arrayContaining([
        0,
        0,
        0.1,
      ]),
    });
  });

  it('本が選択されている時、Aキーで左に移動', () => {
    mockGetState.mockReturnValue({
      selectedBookIds: ['book1'],
      books: [{ id: 'book1', position: [0, 0, 0] }],
      physicsEnabled: false,
    });

    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: 'a' });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(mockMoveBook).toHaveBeenCalledWith('book1', {
      position: expect.arrayContaining([
        -0.1,
        0,
        0,
      ]),
    });
  });

  it('本が選択されている時、Dキーで右に移動', () => {
    mockGetState.mockReturnValue({
      selectedBookIds: ['book1'],
      books: [{ id: 'book1', position: [0, 0, 0] }],
      physicsEnabled: false,
    });

    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: 'd' });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(mockMoveBook).toHaveBeenCalledWith('book1', {
      position: expect.arrayContaining([
        0.1,
        0,
        0,
      ]),
    });
  });

  it('複数の本が選択されている場合、全ての本が移動する', () => {
    mockGetState.mockReturnValue({
      selectedBookIds: ['book1', 'book2', 'book3'],
      books: [
        { id: 'book1', position: [0, 0, 0] },
        { id: 'book2', position: [1, 0, 0] },
        { id: 'book3', position: [2, 0, 0] },
      ],
      physicsEnabled: false,
    });

    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: 'w' });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(mockMoveBook).toHaveBeenCalledTimes(3);
    expect(mockMoveBook).toHaveBeenCalledWith('book1', expect.any(Object));
    expect(mockMoveBook).toHaveBeenCalledWith('book2', expect.any(Object));
    expect(mockMoveBook).toHaveBeenCalledWith('book3', expect.any(Object));
  });

  it('物理演算が有効な場合、WASDキーが無効になる', () => {
    mockGetState.mockReturnValue({
      selectedBookIds: ['book1'],
      physicsEnabled: true,
    });

    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: 'w' });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(mockMoveBook).not.toHaveBeenCalled();
  });

  it('Spaceキーで物理演算をトグル', () => {
    renderHook(() => useKeyboardControls());

    const event = new KeyboardEvent('keydown', { key: ' ' });
    act(() => {
      document.dispatchEvent(event);
    });

    expect(mockTogglePhysics).toHaveBeenCalledWith(true);
  });

  it('アンマウント時にイベントリスナーが削除される', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => useKeyboardControls());
    
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});