import { getDB } from './database';
import { getAllBooks } from './bookOperations';
import { getImagesByBookId } from './imageOperations';
import { DBBook, DBImage } from './schema';

export interface CacheData {
  books: DBBook[];
  images: Map<string, DBImage[]>;
  lastUpdated: Date;
}

export async function getCachedData(): Promise<CacheData> {
  const books = await getAllBooks();
  const images = new Map<string, DBImage[]>();
  
  // Get all images for each book
  for (const book of books) {
    const bookImages = await getImagesByBookId(book.id);
    if (bookImages.length > 0) {
      images.set(book.id, bookImages);
    }
  }
  
  return {
    books,
    images,
    lastUpdated: new Date(),
  };
}

export async function preloadImages(bookIds: string[]): Promise<void> {
  const imagePromises = bookIds.map(async (bookId) => {
    const images = await getImagesByBookId(bookId);
    // In a real app, you might want to create blob URLs or preload them in memory
    return images;
  });
  
  await Promise.all(imagePromises);
}

export async function clearOldCache(daysOld: number = 30): Promise<void> {
  const db = await getDB();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  // Get all old books
  const allBooks = await getAllBooks();
  const oldBooks = allBooks.filter(book => book.updatedAt < cutoffDate);
  
  // Delete old books and their images
  for (const book of oldBooks) {
    await deleteImagesByBookId(book.id);
    await db.delete('books', book.id);
  }
}

export async function getCacheSize(): Promise<{ books: number; images: number; totalSizeBytes: number }> {
  const books = await getAllBooks();
  const db = await getDB();
  const allImages = await db.getAll('images');
  
  let totalSize = 0;
  
  // Calculate approximate size
  books.forEach(book => {
    totalSize += JSON.stringify(book).length;
    if (book.coverImage) {
      totalSize += book.coverImage.length;
    }
  });
  
  allImages.forEach(image => {
    totalSize += image.imageData.length + JSON.stringify(image).length;
  });
  
  return {
    books: books.length,
    images: allImages.length,
    totalSizeBytes: totalSize,
  };
}