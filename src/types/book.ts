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
  textureUrl?: string; // 表紙のテクスチャ
  coverImageData?: string; // 表紙のプレビュー画像
  spineTextureUrl?: string; // 背表紙のテクスチャ
  backCoverTextureUrl?: string; // 裏表紙のテクスチャ
  topBottomTextureUrl?: string; // 天地共通のテクスチャ
  edgeColor?: string; // 小口の色（デフォルト: クリーム色）
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export interface BookStackState {
  books: Book[];
  selectedBookIds: string[];
  viewMode: 'stack' | 'shelf' | 'grid';
  physicsEnabled: boolean;
}