import { getDB } from './database';
import type { DBBook } from './schema';
import { STORES } from './schema';
import { deleteImagesByBookId } from './imageOperations';

export async function saveBook(book: Omit<DBBook, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDB();
  const id = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const bookRecord: DBBook = {
    ...book,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.add(STORES.BOOKS, bookRecord);
  return id;
}

export async function getBook(bookId: string): Promise<DBBook | undefined> {
  const db = await getDB();
  return await db.get(STORES.BOOKS, bookId);
}

export async function getAllBooks(): Promise<DBBook[]> {
  const db = await getDB();
  return await db.getAll(STORES.BOOKS);
}

export async function getBooksByAuthor(author: string): Promise<DBBook[]> {
  const db = await getDB();
  return await db.getAllFromIndex(STORES.BOOKS, 'by-author', author);
}

export async function getBooksByTitle(title: string): Promise<DBBook[]> {
  const db = await getDB();
  return await db.getAllFromIndex(STORES.BOOKS, 'by-title', title);
}

export async function updateBook(bookId: string, updates: Partial<Omit<DBBook, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDB();
  const book = await db.get(STORES.BOOKS, bookId);
  
  if (book) {
    const updatedBook: DBBook = {
      ...book,
      ...updates,
      updatedAt: new Date(),
    };
    await db.put(STORES.BOOKS, updatedBook);
  }
}

export async function deleteBook(bookId: string): Promise<void> {
  const db = await getDB();
  
  // Delete associated images first
  await deleteImagesByBookId(bookId);
  
  // Then delete the book
  await db.delete(STORES.BOOKS, bookId);
}

export async function searchBooks(query: string): Promise<DBBook[]> {
  const db = await getDB();
  const allBooks = await db.getAll(STORES.BOOKS);
  
  const lowercaseQuery = query.toLowerCase();
  return allBooks.filter(book => 
    book.title.toLowerCase().includes(lowercaseQuery) ||
    book.author.toLowerCase().includes(lowercaseQuery)
  );
}