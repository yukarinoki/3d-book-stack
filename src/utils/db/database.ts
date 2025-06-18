import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DBBook, DBImage, DB_NAME, DB_VERSION, STORES } from './schema';

interface BookStackDBSchema extends DBSchema {
  [STORES.BOOKS]: {
    key: string;
    value: DBBook;
    indexes: { 'by-title': string; 'by-author': string; 'by-created': Date };
  };
  [STORES.IMAGES]: {
    key: string;
    value: DBImage;
    indexes: { 'by-book': string };
  };
}

let dbInstance: IDBPDatabase<BookStackDBSchema> | null = null;

export async function initDB(): Promise<IDBPDatabase<BookStackDBSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<BookStackDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create books store
      if (!db.objectStoreNames.contains(STORES.BOOKS)) {
        const bookStore = db.createObjectStore(STORES.BOOKS, { keyPath: 'id' });
        bookStore.createIndex('by-title', 'title');
        bookStore.createIndex('by-author', 'author');
        bookStore.createIndex('by-created', 'createdAt');
      }

      // Create images store
      if (!db.objectStoreNames.contains(STORES.IMAGES)) {
        const imageStore = db.createObjectStore(STORES.IMAGES, { keyPath: 'id' });
        imageStore.createIndex('by-book', 'bookId');
      }
    },
  });

  return dbInstance;
}

export async function getDB(): Promise<IDBPDatabase<BookStackDBSchema>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}