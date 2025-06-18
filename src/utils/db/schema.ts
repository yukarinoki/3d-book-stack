export interface DBBook {
  id: string;
  title: string;
  author: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  bookType: 'paperback' | 'hardcover' | 'softcover' | 'manga';
  coverImage?: string; // Base64 encoded image data
  createdAt: Date;
  updatedAt: Date;
}

export interface DBImage {
  id: string;
  bookId: string;
  imageData: string; // Base64 encoded image
  mimeType: string;
  size: number;
  createdAt: Date;
}

export const DB_NAME = 'BookStackDB';
export const DB_VERSION = 1;

export const STORES = {
  BOOKS: 'books',
  IMAGES: 'images',
} as const;