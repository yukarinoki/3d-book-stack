import type { Book } from '@/types';
import type { DBBook } from './schema';
import { getAllBooks, updateBook as updateDBBook, deleteBook as deleteDBBook } from './bookOperations';
import { updateBookCoverImage } from './imageOperations';
import { initDB, getDB } from './database';

// Convert between app Book type and DB Book type
export function convertToDBBook(book: Book): Omit<DBBook, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: book.title,
    author: book.author,
    dimensions: book.dimensions,
    bookType: book.bookType,
    coverImage: book.coverImageData,
  };
}

export function convertFromDBBook(dbBook: DBBook): Book {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    dimensions: dbBook.dimensions,
    bookType: dbBook.bookType,
    coverImageData: dbBook.coverImage,
  };
}

// Sync operations
export async function syncBookToIndexedDB(book: Book): Promise<void> {
  await initDB();
  
  // Check if book exists
  const existingBooks = await getAllBooks();
  const exists = existingBooks.some(b => b.id === book.id);
  
  if (exists) {
    // Update existing book
    await updateDBBook(book.id, convertToDBBook(book));
  } else {
    // Save new book with the existing ID
    const dbBook: DBBook = {
      ...convertToDBBook(book),
      id: book.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Use direct database operation to preserve the ID
    const db = await getDB();
    await db.add('books', dbBook);
  }
}

export async function syncAllBooksToIndexedDB(books: Book[]): Promise<void> {
  await initDB();
  
  for (const book of books) {
    await syncBookToIndexedDB(book);
  }
}

export async function loadBooksFromIndexedDB(): Promise<Book[]> {
  await initDB();
  
  const dbBooks = await getAllBooks();
  return dbBooks.map(convertFromDBBook);
}

export async function deleteBookFromIndexedDB(bookId: string): Promise<void> {
  await initDB();
  await deleteDBBook(bookId);
}

// Helper to save image data
export async function saveBookCoverImage(bookId: string, imageData: string): Promise<void> {
  await initDB();
  await updateBookCoverImage(bookId, imageData);
}