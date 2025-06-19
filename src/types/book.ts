export interface BookDimensions {
  width: number;
  height: number;
  depth: number;
}

export type BookType = 'paperback' | 'hardcover' | 'softcover' | 'manga';

export interface BookTextures {
  front?: string;      // 表紙
  back?: string;       // 裏表紙
  spine?: string;      // 背表紙
  top?: string;        // 天
  bottom?: string;     // 地
  foreEdge?: string;   // 小口
}

export interface Book {
  id: string;
  title: string;
  author: string;
  dimensions: BookDimensions;
  bookType: BookType;
  color?: string;
  textureUrl?: string; // 表紙のテクスチャ（後方互換性のため残す）
  coverImageData?: string; // 表紙のプレビュー画像
  spineTextureUrl?: string; // 背表紙のテクスチャ（後方互換性のため残す）
  backCoverTextureUrl?: string; // 裏表紙のテクスチャ（後方互換性のため残す）
  topBottomTextureUrl?: string; // 天地共通のテクスチャ（後方互換性のため残す）
  edgeColor?: string; // 小口の色（デフォルト: クリーム色）
  position?: [number, number, number];
  rotation?: [number, number, number];
  textures?: BookTextures; // 新しいテクスチャ管理方式
  purchaseDate?: string | null; // 購入日 (ISO 8601形式)
  finishDate?: string | null; // 終読日 (ISO 8601形式)
  rating?: BookRating; // 評価
}

export type ViewMode = 'stack' | 'shelf' | 'grid' | 'timeline' | 'rating';
export type TimelinePeriod = 'week' | 'month' | 'year';
export type BookRating = 'bad' | 'good' | 'very good';

export interface BookStackState {
  books: Book[];
  selectedBookIds: string[];
  viewMode: ViewMode;
  physicsEnabled: boolean;
  timelinePeriod: TimelinePeriod;
}