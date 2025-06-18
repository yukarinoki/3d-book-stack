import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Book } from '@/types';
import { createMockBooks } from '@/utils';
import { 
  syncBookToIndexedDB, 
  syncAllBooksToIndexedDB, 
  loadBooksFromIndexedDB, 
  deleteBookFromIndexedDB 
} from '@/utils/db/syncOperations';

export interface BookStackState {
  books: Book[];
  selectedBookIds: string[];
  viewMode: 'stack' | 'shelf' | 'grid';
  physicsEnabled: boolean;
}

export interface BookStackActions {
  // 本の操作
  addBook: (book: Omit<Book, 'id'>) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBooks: (ids: string[]) => Promise<void>;
  
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
  initializeBooks: () => Promise<void>;
  resetBooks: () => void;
  
  // IndexedDB同期
  loadFromIndexedDB: () => Promise<void>;
  syncToIndexedDB: () => Promise<void>;
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
        addBook: async (bookData) => {
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
          // Sync to IndexedDB
          await syncBookToIndexedDB(newBook);
        },
        
        removeBook: async (id) => {
          set(
            (state) => ({
              books: state.books.filter((book) => book.id !== id),
              selectedBookIds: state.selectedBookIds.filter((bookId) => bookId !== id),
            }),
            false,
            'removeBook'
          );
          // Remove from IndexedDB
          await deleteBookFromIndexedDB(id);
        },
        
        updateBook: async (id, updates) => {
          let updatedBook: Book | undefined;
          set(
            (state) => {
              const newBooks = state.books.map((book) => {
                if (book.id === id) {
                  updatedBook = { ...book, ...updates };
                  return updatedBook;
                }
                return book;
              });
              return { books: newBooks };
            },
            false,
            'updateBook'
          );
          // Sync to IndexedDB
          if (updatedBook) {
            await syncBookToIndexedDB(updatedBook);
          }
        },
        
        deleteBooks: async (ids) => {
          set(
            (state) => ({
              books: state.books.filter((book) => !ids.includes(book.id)),
              selectedBookIds: state.selectedBookIds.filter((bookId) => !ids.includes(bookId)),
            }),
            false,
            'deleteBooks'
          );
          // Remove from IndexedDB
          await Promise.all(ids.map(id => deleteBookFromIndexedDB(id)));
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
        initializeBooks: async () => {
          // First try to load from IndexedDB
          const dbBooks = await loadBooksFromIndexedDB();
          if (dbBooks.length > 0) {
            set({ books: dbBooks }, false, 'initializeBooks');
          } else {
            // If no books in IndexedDB, create mock books
            const mockBooks = createMockBooks();
            set({ books: mockBooks }, false, 'initializeBooks');
            // Sync mock books to IndexedDB
            await syncAllBooksToIndexedDB(mockBooks);
          }
        },
        
        resetBooks: () => {
          set(initialState, false, 'resetBooks');
        },
        
        // IndexedDB同期
        loadFromIndexedDB: async () => {
          const books = await loadBooksFromIndexedDB();
          set({ books }, false, 'loadFromIndexedDB');
        },
        
        syncToIndexedDB: async () => {
          const { books } = get();
          await syncAllBooksToIndexedDB(books);
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