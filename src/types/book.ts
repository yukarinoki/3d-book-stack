export interface BookDimensions {
  width: number;
  height: number;
  depth: number;
}

export type BookType = 'paperback' | 'hardcover' | 'softcover' | 'manga';

export interface Book {
  id: string;
  title: string;
  author: string;
  dimensions: BookDimensions;
  bookType: BookType;
  color?: string;
  textureUrl?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export interface BookStackState {
  books: Book[];
  selectedBookIds: string[];
  viewMode: 'stack' | 'shelf' | 'grid';
  physicsEnabled: boolean;
}