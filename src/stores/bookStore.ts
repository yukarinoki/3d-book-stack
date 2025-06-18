import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Book } from '@/types';
import { createMockBooks } from '@/utils';

export interface BookStackState {
  books: Book[];
  selectedBookIds: string[];
  viewMode: 'stack' | 'shelf' | 'grid';
  physicsEnabled: boolean;
}

export interface BookStackActions {
  // 本の操作
  addBook: (book: Omit<Book, 'id'>) => void;
  removeBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  
  // 選択状態の管理
  selectBook: (id: string) => void;
  deselectBook: (id: string) => void;
  toggleBookSelection: (id: string) => void;
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;
  
  // 表示モードの管理
  setViewMode: (mode: BookStackState['viewMode']) => void;
  
  // 物理演算の管理
  setPhysicsEnabled: (enabled: boolean) => void;
  
  // 初期化
  initializeBooks: () => void;
  resetBooks: () => void;
}

export type BookStore = BookStackState & BookStackActions;

const initialState: BookStackState = {
  books: [],
  selectedBookIds: [],
  viewMode: 'stack',
  physicsEnabled: true,
};

export const useBookStore = create<BookStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // 本の操作
        addBook: (bookData) => {
          const newBook: Book = {
            ...bookData,
            id: crypto.randomUUID(),
          };
          set(
            (state) => ({
              books: [...state.books, newBook],
            }),
            false,
            'addBook'
          );
        },
        
        removeBook: (id) => {
          set(
            (state) => ({
              books: state.books.filter((book) => book.id !== id),
              selectedBookIds: state.selectedBookIds.filter((bookId) => bookId !== id),
            }),
            false,
            'removeBook'
          );
        },
        
        updateBook: (id, updates) => {
          set(
            (state) => ({
              books: state.books.map((book) =>
                book.id === id ? { ...book, ...updates } : book
              ),
            }),
            false,
            'updateBook'
          );
        },
        
        // 選択状態の管理
        selectBook: (id) => {
          set(
            (state) => ({
              selectedBookIds: state.selectedBookIds.includes(id)
                ? state.selectedBookIds
                : [...state.selectedBookIds, id],
            }),
            false,
            'selectBook'
          );
        },
        
        deselectBook: (id) => {
          set(
            (state) => ({
              selectedBookIds: state.selectedBookIds.filter((bookId) => bookId !== id),
            }),
            false,
            'deselectBook'
          );
        },
        
        toggleBookSelection: (id) => {
          const { selectedBookIds } = get();
          if (selectedBookIds.includes(id)) {
            get().deselectBook(id);
          } else {
            get().selectBook(id);
          }
        },
        
        clearSelection: () => {
          set({ selectedBookIds: [] }, false, 'clearSelection');
        },
        
        selectMultiple: (ids) => {
          set({ selectedBookIds: ids }, false, 'selectMultiple');
        },
        
        // 表示モードの管理
        setViewMode: (mode) => {
          set({ viewMode: mode }, false, 'setViewMode');
        },
        
        // 物理演算の管理
        setPhysicsEnabled: (enabled) => {
          set({ physicsEnabled: enabled }, false, 'setPhysicsEnabled');
        },
        
        // 初期化
        initializeBooks: () => {
          const mockBooks = createMockBooks();
          set({ books: mockBooks }, false, 'initializeBooks');
        },
        
        resetBooks: () => {
          set(initialState, false, 'resetBooks');
        },
      }),
      {
        name: 'book-stack-storage',
        partialize: (state) => ({
          books: state.books,
          viewMode: state.viewMode,
          physicsEnabled: state.physicsEnabled,
        }),
      }
    ),
    {
      name: 'BookStore',
    }
  )
);