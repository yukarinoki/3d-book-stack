import { getDB } from './database';
import { DBImage, STORES } from './schema';

export async function saveImage(bookId: string, imageData: string, mimeType: string): Promise<string> {
  const db = await getDB();
  const id = `img_${bookId}_${Date.now()}`;
  
  const imageRecord: DBImage = {
    id,
    bookId,
    imageData,
    mimeType,
    size: imageData.length,
    createdAt: new Date(),
  };

  await db.add(STORES.IMAGES, imageRecord);
  return id;
}

export async function getImage(imageId: string): Promise<DBImage | undefined> {
  const db = await getDB();
  return await db.get(STORES.IMAGES, imageId);
}

export async function getImagesByBookId(bookId: string): Promise<DBImage[]> {
  const db = await getDB();
  return await db.getAllFromIndex(STORES.IMAGES, 'by-book', bookId);
}

export async function deleteImage(imageId: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORES.IMAGES, imageId);
}

export async function deleteImagesByBookId(bookId: string): Promise<void> {
  const db = await getDB();
  const images = await getImagesByBookId(bookId);
  
  const tx = db.transaction(STORES.IMAGES, 'readwrite');
  await Promise.all([
    ...images.map(image => tx.store.delete(image.id)),
    tx.done,
  ]);
}

export async function updateBookCoverImage(bookId: string, imageData: string): Promise<void> {
  const db = await getDB();
  const book = await db.get(STORES.BOOKS, bookId);
  
  if (book) {
    book.coverImage = imageData;
    book.updatedAt = new Date();
    await db.put(STORES.BOOKS, book);
  }
}