import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBookStore } from '../bookStore';
import { mockBooks } from '@/data/mockBooks';
import type { Book } from '@/types';

// Mock the database operations
vi.mock('@/utils/db', () => ({
  saveBook: vi.fn(),
  deleteBook: vi.fn(),
  deleteBooks: vi.fn(),
  getAllBooks: vi.fn(),
  loadBooksFromIndexedDB: vi.fn(() => Promise.resolve([])),
  syncBookToIndexedDB: vi.fn(() => Promise.resolve()),
  syncAllBooksToIndexedDB: vi.fn(() => Promise.resolve()),
  deleteBookFromIndexedDB: vi.fn(() => Promise.resolve()),
  deleteBooksFromIndexedDB: vi.fn(() => Promise.resolve()),
}));

// Mock IndexedDB
global.indexedDB = {} as any;

describe('bookStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useBookStore.setState({
      books: [],
      selectedBookIds: [],
      hoveredBookId: null,
      viewMode: 'stack',
      physicsEnabled: true,
      timelinePeriod: 'week',
    });
  });

  describe('Book Management', () => {
    it('should initialize with empty books', () => {
      const { books } = useBookStore.getState();
      expect(books).toEqual([]);
    });

    it('should add a new book', async () => {
      const newBook: Book = {
        id: 'test-1',
        title: 'Test Book',
        author: 'Test Author',
        dimensions: { width: 100, height: 150, depth: 20 },
        bookType: 'paperback',
      };

      await useBookStore.getState().addBook(newBook);
      
      const { books } = useBookStore.getState();
      expect(books).toHaveLength(1);
      expect(books[0]).toEqual(newBook);
    });

    it('should update an existing book', async () => {
      const book: Book = {
        id: 'test-1',
        title: 'Original Title',
        author: 'Test Author',
        dimensions: { width: 100, height: 150, depth: 20 },
        bookType: 'paperback',
      };

      await useBookStore.getState().addBook(book);
      await useBookStore.getState().updateBook('test-1', { title: 'Updated Title' });
      
      const { books } = useBookStore.getState();
      expect(books[0].title).toBe('Updated Title');
    });

    it('should delete a book', async () => {
      const book: Book = {
        id: 'test-1',
        title: 'Test Book',
        author: 'Test Author',
        dimensions: { width: 100, height: 150, depth: 20 },
        bookType: 'paperback',
      };

      await useBookStore.getState().addBook(book);
      await useBookStore.getState().deleteBook('test-1');
      
      const { books } = useBookStore.getState();
      expect(books).toHaveLength(0);
    });

    it('should delete multiple books', async () => {
      const books: Book[] = [
        {
          id: 'test-1',
          title: 'Book 1',
          author: 'Author 1',
          dimensions: { width: 100, height: 150, depth: 20 },
          bookType: 'paperback',
        },
        {
          id: 'test-2',
          title: 'Book 2',
          author: 'Author 2',
          dimensions: { width: 110, height: 160, depth: 25 },
          bookType: 'hardcover',
        },
        {
          id: 'test-3',
          title: 'Book 3',
          author: 'Author 3',
          dimensions: { width: 105, height: 148, depth: 15 },
          bookType: 'paperback',
        },
      ];

      for (const book of books) {
        await useBookStore.getState().addBook(book);
      }

      await useBookStore.getState().deleteBooks(['test-1', 'test-3']);
      
      const { books: remainingBooks } = useBookStore.getState();
      expect(remainingBooks).toHaveLength(1);
      expect(remainingBooks[0].id).toBe('test-2');
    });

    it('should initialize books from mock data', async () => {
      await useBookStore.getState().initializeBooks();
      
      const { books } = useBookStore.getState();
      expect(books).toHaveLength(mockBooks.length);
      expect(books).toEqual(mockBooks);
    });
  });

  describe('Selection Management', () => {
    beforeEach(async () => {
      // Add some test books
      const books: Book[] = [
        {
          id: 'test-1',
          title: 'Book 1',
          author: 'Author 1',
          dimensions: { width: 100, height: 150, depth: 20 },
          bookType: 'paperback',
        },
        {
          id: 'test-2',
          title: 'Book 2',
          author: 'Author 2',
          dimensions: { width: 110, height: 160, depth: 25 },
          bookType: 'hardcover',
        },
      ];
      
      for (const book of books) {
        await useBookStore.getState().addBook(book);
      }
    });

    it('should select a single book', () => {
      useBookStore.getState().selectBook('test-1');
      
      const { selectedBookIds } = useBookStore.getState();
      expect(selectedBookIds).toEqual(['test-1']);
    });

    it('should toggle book selection', () => {
      useBookStore.getState().toggleBookSelection('test-1');
      
      let { selectedBookIds } = useBookStore.getState();
      expect(selectedBookIds).toEqual(['test-1']);
      
      useBookStore.getState().toggleBookSelection('test-1');
      
      selectedBookIds = useBookStore.getState().selectedBookIds;
      expect(selectedBookIds).toEqual([]);
    });

    it('should clear selection', () => {
      useBookStore.getState().selectBook('test-1');
      useBookStore.getState().toggleBookSelection('test-2');
      
      let { selectedBookIds } = useBookStore.getState();
      expect(selectedBookIds).toHaveLength(2);
      
      useBookStore.getState().clearSelection();
      
      selectedBookIds = useBookStore.getState().selectedBookIds;
      expect(selectedBookIds).toEqual([]);
    });

    it('should set hovered book', () => {
      useBookStore.getState().setHoveredBook('test-1');
      
      const { hoveredBookId } = useBookStore.getState();
      expect(hoveredBookId).toBe('test-1');
      
      useBookStore.getState().setHoveredBook(null);
      
      const { hoveredBookId: clearedHoverId } = useBookStore.getState();
      expect(clearedHoverId).toBeNull();
    });
  });

  describe('View Mode Management', () => {
    it('should set view mode', () => {
      useBookStore.getState().setViewMode('grid');
      
      const { viewMode } = useBookStore.getState();
      expect(viewMode).toBe('grid');
    });

    it('should toggle physics', () => {
      const initialPhysics = useBookStore.getState().physicsEnabled;
      
      useBookStore.getState().setPhysicsEnabled(!initialPhysics);
      
      const { physicsEnabled } = useBookStore.getState();
      expect(physicsEnabled).toBe(!initialPhysics);
    });

    it('should set timeline period', () => {
      useBookStore.getState().setTimelinePeriod('month');
      
      const { timelinePeriod } = useBookStore.getState();
      expect(timelinePeriod).toBe('month');
    });

    it('should set view mode to single', () => {
      useBookStore.getState().setViewMode('single');
      
      const { viewMode } = useBookStore.getState();
      expect(viewMode).toBe('single');
    });
  });

  describe('Batch Operations', () => {
    beforeEach(async () => {
      // Add test books
      const books: Book[] = [
        {
          id: 'test-1',
          title: 'Book 1',
          author: 'Author 1',
          dimensions: { width: 100, height: 150, depth: 20 },
          bookType: 'paperback',
        },
        {
          id: 'test-2',
          title: 'Book 2',
          author: 'Author 2',
          dimensions: { width: 110, height: 160, depth: 25 },
          bookType: 'hardcover',
        },
        {
          id: 'test-3',
          title: 'Book 3',
          author: 'Author 3',
          dimensions: { width: 105, height: 148, depth: 15 },
          bookType: 'paperback',
        },
      ];
      
      for (const book of books) {
        await useBookStore.getState().addBook(book);
      }
    });

    it('should update color for selected books', async () => {
      useBookStore.getState().selectBook('test-1');
      useBookStore.getState().toggleBookSelection('test-2');
      
      await useBookStore.getState().updateSelectedBooksColor('#FF0000');
      
      const { books } = useBookStore.getState();
      expect(books[0].color).toBe('#FF0000');
      expect(books[1].color).toBe('#FF0000');
      expect(books[2].color).toBeUndefined();
    });

    it('should clear selection after deleting selected books', async () => {
      useBookStore.getState().selectBook('test-1');
      useBookStore.getState().toggleBookSelection('test-2');
      
      await useBookStore.getState().deleteBooks(['test-1', 'test-2']);
      
      const { selectedBookIds } = useBookStore.getState();
      expect(selectedBookIds).toEqual([]);
    });
  });
});