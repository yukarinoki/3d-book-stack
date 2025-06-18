import type { Book } from '@/types';

export interface PositionedBook extends Book {
  position: [number, number, number];
  rotation: [number, number, number];
}

export const positionBooksForMode = (
  books: Book[],
  mode: 'stack' | 'shelf' | 'grid'
): PositionedBook[] => {
  switch (mode) {
    case 'stack':
      return positionBooksInStack(books);
    case 'shelf':
      return positionBooksOnShelf(books);
    case 'grid':
      return positionBooksInGrid(books);
    default:
      return positionBooksInStack(books);
  }
};

// 既存のスタックモード（水平積み重ね）
const positionBooksInStack = (books: Book[]): PositionedBook[] => {
  let currentHeight = 0;
  const stackSpacing = 0.05; // 50mmの間隔

  return books.map((book) => {
    const bookHeight = book.dimensions.depth / 1000;
    const yPosition = currentHeight + bookHeight / 2;
    currentHeight += bookHeight + stackSpacing;

    // 水平方向のランダム性を追加
    const randomOffsetRange = 0.05;
    const randomX = (Math.random() - 0.5) * randomOffsetRange;
    const randomZ = (Math.random() - 0.5) * randomOffsetRange;

    return {
      ...book,
      position: [randomX, yPosition, randomZ] as [number, number, number],
      rotation: [-Math.PI / 2, 0, 0] as [number, number, number], // 表紙が上向き
    };
  });
};

// 表紙並べモード（表紙が正面を向く）
const positionBooksInGrid = (books: Book[]): PositionedBook[] => {
  const booksPerRow = Math.ceil(Math.sqrt(books.length));
  const spacing = 0.3; // 30cmの間隔
  
  return books.map((book, index) => {
    const row = Math.floor(index / booksPerRow);
    const col = index % booksPerRow;
    
    // グリッド中央寄せのためのオフセット
    const totalWidth = (booksPerRow - 1) * spacing;
    const startX = -totalWidth / 2;
    const totalHeight = Math.ceil(books.length / booksPerRow - 1) * spacing;
    const startZ = -totalHeight / 2;
    
    const x = startX + col * spacing;
    const z = startZ + row * spacing;
    const y = 0; // 床レベル
    
    return {
      ...book,
      position: [x, y, z] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number], // 表紙が正面を向く（直立）
    };
  });
};

// 背表紙並べモード（本棚風）
const positionBooksOnShelf = (books: Book[]): PositionedBook[] => {
  let currentX = 0;
  const shelfSpacing = 0.01; // 1cmの間隔
  
  return books.map((book) => {
    const bookWidth = book.dimensions.width / 1000;
    const x = currentX + bookWidth / 2;
    currentX += bookWidth + shelfSpacing;
    
    return {
      ...book,
      position: [x, 0, 0] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number], // 背表紙が正面を向く
    };
  });
};